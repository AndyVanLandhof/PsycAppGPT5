// seed-neon.cjs — seeds all RS vault chunks into Neon Postgres
// Run with: node scripts/seed-neon.cjs

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const VAULT_ROOT = path.join(__dirname, '../public/vault/ocr-rs/vault');

async function setup(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS vault_chunks (
      id SERIAL PRIMARY KEY,
      source_file TEXT NOT NULL,
      subject TEXT,
      section TEXT,
      title TEXT,
      content TEXT NOT NULL,
      page INTEGER
    )
  `);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_vault_subject ON vault_chunks(subject)`);
  await client.query(`TRUNCATE vault_chunks RESTART IDENTITY`);
  console.log('Table ready, existing rows cleared.');
}

function parseMeta(relPath) {
  const parts = relPath.split(path.sep);
  return {
    subject: parts[0] || null,
    section: parts[1] || null,
  };
}

function findChunkFiles(dir, base) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findChunkFiles(full, base);
      results.push(...findChunkFiles(full, base));
    } else if (entry.name.endsWith('_chunks.json')) {
      results.push(full);
    }
  }
  return results;
}

// deduplicate
function uniqueFiles(files) {
  return [...new Set(files)];
}

async function seed() {
  const client = await pool.connect();
  try {
    await setup(client);

    const allFiles = uniqueFiles(findChunkFiles(VAULT_ROOT, VAULT_ROOT));
    console.log(`Found ${allFiles.length} chunk files.`);

    let totalRows = 0;

    for (const filePath of allFiles) {
      const relPath = path.relative(VAULT_ROOT, filePath);
      const { subject, section } = parseMeta(relPath);
      let raw;
      try {
        raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.warn(`Skipping unreadable file: ${relPath}`);
        continue;
      }

      const chunks = Array.isArray(raw) ? raw : (raw.chunks || []);
      if (!chunks.length) {
        console.warn(`No chunks in: ${relPath}`);
        continue;
      }

      for (const chunk of chunks) {
        // Strip null bytes — Postgres UTF8 rejects 0x00
        const clean = s => (s || '').replace(/\0/g, '');
        await client.query(
          `INSERT INTO vault_chunks (source_file, subject, section, title, content, page)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [relPath, subject, section, clean(chunk.title), clean(chunk.content), chunk.page || null]
        );
      }

      totalRows += chunks.length;
      console.log(`  ✓ ${relPath} (${chunks.length} chunks)`);
    }

    console.log(`\nDone. ${totalRows} rows inserted across ${allFiles.length} files.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

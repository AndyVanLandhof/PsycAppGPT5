// api/vault-chunks.js — Vercel serverless function
// Returns all OCR RS vault chunks from Neon Postgres in the format vaultLoader expects

import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
  }
  return pool;
}

function extractMeta(sourceFile) {
  const parts = sourceFile.split('/');
  const filename = parts[parts.length - 1];
  const folderPath = parts.slice(0, -1).join('/');
  const lower = folderPath.toLowerCase();

  let type = 'textbook';
  if (lower.includes('pastpapers') || lower.includes('past papers')) type = 'pastpaper';
  else if (lower.includes('exam')) type = 'exam';

  const subtopic = filename
    .replace('_chunks.json', '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const encodedFolder = folderPath.split('/').map(s => encodeURIComponent(s)).join('/');
  const encodedFile = encodeURIComponent(filename.replace('_chunks.json', '.pdf'));
  const pdfUrl = `/vault/ocr-rs/${encodedFolder}/${encodedFile}`;

  return { folderPath, filename, subtopic, type, pdfUrl };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await getPool().connect();
    let rows;
    try {
      const result = await client.query(
        'SELECT id, source_file, title, content, page FROM vault_chunks ORDER BY id'
      );
      rows = result.rows;
    } finally {
      client.release();
    }

    const chunks = rows.map((row, i) => {
      const { folderPath, filename, subtopic, type, pdfUrl } = extractMeta(row.source_file);
      return {
        id: `vault/${folderPath}-${filename}-${i}`,
        content: row.content,
        source: filename.replace('_chunks.json', '.pdf'),
        page: row.page,
        title: row.title || '',
        pdfUrl,
        metadata: {
          topic: 'religious-studies',
          subtopic,
          type,
        },
      };
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(chunks);
  } catch (err) {
    console.error('[vault-chunks] error:', err);
    return res.status(500).json({ error: 'Failed to load vault chunks' });
  }
}

/**
 * Generate synthetic A-star / B / C style answers for
 * AQA A-level Psychology Paper 3 – Issues and options in psychology (e.g. 9(1F/G/H) Specimen & 2018–2024).
 *
 * This is an OFFLINE helper for calibrating the examiner persona. It does NOT
 * affect the live app directly.
 *
 * Usage:
 *   node scripts/generate-englit-p3-samples.cjs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.EXAMINER_MODEL || 'gpt-4o';
const ROOT = path.join(__dirname, '..', 'public', 'vault', 'ocr-rs', 'vault', 'PastPapers', 'Psychology');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'aqa-psych_paper3-issues-options_samples.json');

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot build AQA Paper 3 samples.');
  process.exit(1);
}

function listFiles() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('_extracted.txt') && /Paper 3 AQA Psychology A-level/.test(f));
}

function readFile(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

function extractQuestionsFromQP(text) {
  const lines = text.split('\n');
  const questions = [];
  let current = null;
  let buffer = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const qMatch = line.match(/^(\d+)\s*(.+)/);
    if (qMatch) {
      if (current && buffer.length > 0) {
        current.text = buffer.join(' ');
        questions.push(current);
        buffer = [];
      }
      current = {
        number: qMatch[1],
        text: qMatch[2],
        marks: 0,
        section: 'Issues and Options'
      };
      continue;
    }
    const mMatch = line.match(/\[(\d+)\s*marks?\]/i);
    if (mMatch && current) {
      current.marks = parseInt(mMatch[1], 10);
      continue;
    }
    if (current && line) {
      buffer.push(line);
    }
  }
  if (current && buffer.length > 0) {
    current.text = [current.text].concat(buffer).join(' ');
    questions.push(current);
  }
  return questions;
}

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_MODEL}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1800,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error: ${body || res.statusText}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse JSON from OpenAI response: ${content.slice(0, 200)}...`);
  }
}

function buildGenerationPrompt(paperMeta, q, msSection) {
  return `
You are an AQA A-level Psychology examiner for:
  Specification: 7182
  Paper 3 – Issues and options in psychology.

Your task is to generate model student answers for calibration.

QUESTION:
${q.number}. ${q.text} [${q.marks} marks]

This is a ${q.marks}-mark essay question assessing both AO1 (knowledge and understanding of psychological concepts, theories, studies) and AO2 (application, analysis and evaluation, including issues and debates).

RELEVANT MARK SCHEME EXTRACT:
${msSection || '(No detailed extract available; use your knowledge of OCR/AQA-style 16/24-mark essay level descriptors – top band ≈ 80–90% of marks, B-band ≈ 60–70%, C-band ≈ 45–55%, always requiring clear evidence for the level awarded.)'}

Generate three responses to this exact question:
- One **A***-level answer (top band, high-level 5/4 depending on scheme).
- One **B**-level answer (mid band).
- One **C**-level answer (secure but limited/partial).

For each response, ensure:
- AO1: accurate, relevant, well-organised knowledge and understanding of key concepts/theories/findings.
- AO2: clear, sustained analysis and evaluation, including strengths, weaknesses, counter-arguments and issues/debates (e.g. gender bias, culture bias, ethical issues, determinism vs free will, nature–nurture, reductionism–holism, etc.).
- Use appropriate specialist terminology and integrate relevant research evidence.
- Match the expected length and detail of a real ${q.marks}-mark answer.
- Do **not** credit anything that is not explicitly written; do **not** infer knowledge or evaluation that is not clearly expressed.

Return STRICT JSON:
{
  "questionNumber": "${q.number}",
  "maxMarks": ${q.marks},
  "samples": [
    {
      "label": "A*",
      "targetMarks": ${Math.round(q.marks * 0.8)},
      "rationale": "Why this should be a top-band (A*) response according to OCR/AQA-style level descriptors, including balance of AO1 and AO2.",
      "text": "Full A* style student essay..."
    },
    {
      "label": "B",
      "targetMarks": ${Math.round(q.marks * 0.6)},
      "rationale": "Why this should be a secure B-band response (good AO1 with some effective AO2 but less consistent or detailed than top band).",
      "text": "Full B-grade style student essay..."
    },
    {
      "label": "C",
      "targetMarks": ${Math.round(q.marks * 0.45)},
      "rationale": "Why this should be a mid C-band response (some accurate AO1 and limited AO2, but lacking detail, balance or development).",
      "text": "Full C-grade style student essay..."
    }
  ]
}`;
}

async function main() {
  console.log('🔎 Generating AQA 7182/3 (Paper 3) samples for Issues and options');
  console.log('  Root:', ROOT);

  const files = listFiles();
  if (!files.length) {
    console.error('❌ No Paper 3 AQA Psychology A-level extracted QP/MS files found in', ROOT);
    process.exit(1);
  }

  const paperMeta = {
    paper: 'AQA 7182/3 Issues and options in psychology',
    year: 2019,
    session: 'June',
    code: '7182/3'
  };

  const allQuestions = [];

  for (const file of files) {
    console.log('Reading QP:', file);
    const qpText = readText(file);
    const qs = parseOcrQuestions(qpText);
    allQuestions.push(...qs);
  }

  console.log(`  Parsed ${allQuestions.length} questions for Paper 3.`);

  const msText = readText(MS_PATH);
  const out = {
    paperId: 'aqa-psych_paper3-issues-options',
    meta: paperMeta,
    generatedAt: new Date().toISOString(),
    model: OPENAI_MODEL,
    questions: []
  };

  for (const q of allQuestions) {
    console.log(`\n✏️  Generating samples for Q${q.number} [${q.marks} marks]...`);
    const msSection = extractMarkSchemeSection(msText, q.number);
    const prompt = buildGenerationPrompt(paperMeta, q, msSection);
    try {
      const resp = await callOpenAI(prompt);
      const entry = {
        questionNumber: resp.questionNumber || q.number,
        maxMarks: resp.maxMarks || q.marks,
        section: q.section,
        samples: Array.isArray(resp.samples) ? resp.samples : []
      };
      console.log(`   -> got ${entry.samples.length} samples`);
      out.questions.push(entry);
    } catch (e) {
      console.error(`   ❌ Failed to generate samples for Q${q.number}:`, e.message);
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('\n✅ AQA 7182/3 Issues & options samples written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Unhandled error in run-examiner-eval-ocr-phil:', err.message);
  process.exit(1);
});

/**
 * Generate synthetic A-star / B / C style answers for
 * Edexcel A-level English Literature 9ET0/03 – Paper 3: Poetry (June 2019).
 *
 * Offline evaluation helper; does NOT affect the app build.
 *
 * Usage:
 *   node scripts/generate-englit-p3-samples.cjs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot generate EngLit samples.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const QP_PATH = path.join(
  ROOT,
  'public',
  'vault',
  'ocr-rs',
  'vault',
  'PastPapers',
  'English Literature',
  'June 2019 QP - Paper 3 Edexcel English Literature A-level_extracted.txt'
);
const MS_PATH = path.join(
  ROOT,
  'public',
  'vault',
  'ocr-rs',
  'vault',
  'PastPapers',
  'English Literature',
  'June 2019 MS - Paper 3 Edexcel English Literature A-level_extracted.txt'
);
const OUTPUT_DIR = path.join(ROOT, 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'edexcel-9et0-p3-jun19_samples.json');

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

// Parse 30-mark essay questions from the Edexcel Paper 3 QP
function parseEngLitQuestions(text) {
  const lines = text.split('\n');
  const questions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^(\d+)\s+(.+)/);
    if (!m) continue;
    const number = m[1];
    const parts = [m[2].trim()];
    let j = i + 1;
    // Collect lines until we hit the "Total for Question" line or a new numbered question
    while (
      j < lines.length &&
      !/\(Total for Question\s+\d+\s*=\s*\d+\s*marks\)/i.test(lines[j]) &&
      !/^\d+\s+/.test(lines[j].trim())
    ) {
      const t = lines[j].trim();
      if (t) parts.push(t);
      j++;
    }

    if (j >= lines.length) continue;
    const totalLine = lines[j].trim();
    const mm = totalLine.match(/\(Total for Question\s+\d+\s*=\s*(\d+)\s*marks\)/i);
    if (!mm) continue;
    const marks = parseInt(mm[1], 10);
    questions.push({
      number,
      text: parts.join(' '),
      marks,
      section: 'Poetry'
    });
    i = j + 1;
  }

  // Keep just the 30-mark essay questions
  return questions.filter(q => q.marks === 30 && q.text.length > 10);
}

function extractMarkSchemeSection(msText, qNumber) {
  try {
    const re = new RegExp(`\\n\\s*Question\\s+${qNumber}[^\\n]*[\\s\\S]*?(?=\\n\\s*Question\\s+\\d+|$)`, 'i');
    const match = msText.match(re);
    return match ? match[0] : '';
  } catch {
    return '';
  }
}

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1800,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse JSON from OpenAI response: ${content.slice(0, 200)}...`);
  }
}

function buildGenerationPrompt(paperMeta, question, markSchemeSection) {
  return `
You are an Edexcel A-level English Literature examiner for specification 9ET0,
Paper 3: Poetry (code 9ET0/03).

Your task is to manufacture sample student answers for examiner evaluation.

PAPER: ${paperMeta.paper}
QUESTION ${question.number} [${question.marks} marks]
SECTION: ${question.section}

QUESTION TEXT:
${question.text}

RELEVANT MARK SCHEME EXTRACT (if any):
${markSchemeSection || '(no specific extract available)'}

Generate 3 sample answers aimed at different performance levels:
- One answer that should realistically achieve top-band marks (A* level).
- One answer that should realistically achieve a solid B-grade mark.
- One answer that should realistically achieve a mid C-grade mark.

For each answer:
- Write in a natural A-level student's voice (17–18 years old).
- Reflect Edexcel AO1–AO4 balance for a 30-mark essay:
  - AO1: coherent, informed, personal response using critical terminology.
  - AO2: close analysis of form, structure, and language.
  - AO3: relevant contexts and interpretations.
  - AO4: connections/comparisons where appropriate.
- Match roughly the depth/length of a real 30-mark response.
- Do NOT simply quote the mark scheme; write as a student would.

Return STRICT JSON:
{
  "questionNumber": "${question.number}",
  "maxMarks": ${question.marks},
  "samples": [
    {
      "label": "A*",
      "targetMarks": ${Math.round(question.marks * 0.72)},
      "rationale": "Why this should be top band based on the mark scheme (around 70–75% of the available marks).",
      "text": "Full student-style answer..."
    },
    {
      "label": "B",
      "targetMarks": ${Math.round(question.marks * 0.58)},
      "rationale": "Why this should be a solid B-band response (around high 50s/low 60s percent).",
      "text": "Full student-style answer..."
    },
    {
      "label": "C",
      "targetMarks": ${Math.round(question.marks * 0.46)},
      "rationale": "Why this should be a mid C-band response (around mid-40s percent).",
      "text": "Full student-style answer..."
    }
  ]
}`;
}

async function main() {
  console.log('🔎 Generating Edexcel 9ET0/03 (June 2019) Poetry samples');
  console.log('  QP :', QP_PATH);
  console.log('  MS :', MS_PATH);

  const qpText = readText(QP_PATH);
  const msText = readText(MS_PATH);

  const questions = parseEngLitQuestions(qpText);
  console.log(`  Found ${questions.length} 30-mark questions in QP.`);

  const paperMeta = {
    paper: '9ET0/03 Paper 3: Poetry',
    year: 2019,
    session: 'June',
    code: '9ET0/03'
  };

  const out = {
    paperId: 'edexcel-9et0-p3-jun19',
    meta: paperMeta,
    generatedAt: new Date().toISOString(),
    model: OPENAI_MODEL,
    questions: []
  };

  for (const q of questions) {
    console.log(`\n✏️  Generating samples for Q${q.number} [${q.marks} marks]...`);
    const msSection = extractMarkSchemeSection(msText, q.number);
    const prompt = buildGenerationPrompt(paperMeta, q, msSection);
    try {
      const resp = await callOpenAI(prompt);
      const entry = {
        questionNumber: resp.questionNumber || q.number,
        maxMarks: resp.maxMarks || q.marks,
        section: q.section,
        samples: Array.isArray(resp.samples) ? resp.samples : []
      };
      console.log(`   -> got ${entry.samples.length} samples`);
      out.questions.push(entry);
    } catch (e) {
      console.error(`   ❌ Failed to generate samples for Q${q.number}:`, e.message);
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('\n✅ Edexcel Poetry samples written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Unhandled error in generate-englit-p3-samples:', err);
  process.exit(1);
});



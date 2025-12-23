/**
 * Generate synthetic A-star / B / C style answers for
 * OCR A Level Religious Studies H573/01 – Philosophy of Religion (Oct 2021).
 *
 * This is an OFFLINE evaluation helper. It does NOT affect the app build.
 *
 * Usage:
 *   node scripts/generate-ocr-phil-samples.cjs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot generate OCR samples.');
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
  'Religious Studies',
  '666950-question-paper-philosophy-of-religion_extracted.txt'
);
const MS_PATH = path.join(
  ROOT,
  'public',
  'vault',
  'ocr-rs',
  'vault',
  'PastPapers',
  'Religious Studies',
  '666956-mark-scheme-philosophy-of-religion_extracted.txt'
);
const OUTPUT_DIR = path.join(ROOT, 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ocr-h573-phil-oct21_samples.json');

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

// Parse the four 40-mark questions from the OCR Philosophy of Religion QP
function parseOcrQuestions(text) {
  const lines = text.split('\n');
  const questions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^(\d+)\*\s+(.+)/);
    if (!m) continue;
    const number = m[1];
    const parts = [m[2].trim()];
    let j = i + 1;
    // Accumulate any following lines up to the marks line [40]
    while (j < lines.length && !/\[40\]/.test(lines[j])) {
      const t = lines[j].trim();
      if (t) parts.push(t);
      j++;
    }
    const textStem = parts.join(' ');
    questions.push({
      number,
      text: textStem,
      marks: 40,
      section: 'Philosophy of Religion'
    });
    i = j;
  }

  return questions;
}

// Very simple per-question mark scheme extractor: look for "1.", "2.", etc.
function extractMarkSchemeSection(msText, qNumber) {
  try {
    const re = new RegExp(`\\n\\s*${qNumber}\\.\\s[\\s\\S]*?(?=\\n\\s*\\d+\\.\\s|$)`, 'm');
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
      max_tokens: 1600,
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
You are an OCR A Level Religious Studies examiner for:
  Specification: H573
  Component: H573/01 – Philosophy of Religion

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
- Write in a natural 17–18 year old student's voice.
- Reflect OCR's AO1 (knowledge/understanding) and AO2 (analysis/evaluation) balance for a 40-mark essay.
- Use appropriate RS/Philosophy terminology and references.
- Match roughly the depth/length of a real 40-mark response.
- Do NOT simply quote the mark scheme; write as a student would.

Return STRICT JSON:
{
  "questionNumber": "${question.number}",
  "maxMarks": ${question.marks},
  "samples": [
    {
      "label": "A*",
      "targetMarks": 36,
      "rationale": "Why this should be top band based on the mark scheme.",
      "text": "Full student-style answer..."
    },
    {
      "label": "B",
      "targetMarks": 28,
      "rationale": "Why this should be around a B-grade response.",
      "text": "Full student-style answer..."
    },
    {
      "label": "C",
      "targetMarks": 22,
      "rationale": "Why this should be around a C-grade response.",
      "text": "Full student-style answer..."
    }
  ]
}`;
}

async function main() {
  console.log('🔎 Generating OCR H573/01 Philosophy of Religion samples (Oct 2021)');
  console.log('  QP :', QP_PATH);
  console.log('  MS :', MS_PATH);

  const qpText = readText(QP_PATH);
  const msText = readText(MS_PATH);

  const questions = parseOcrQuestions(qpText);
  console.log(`  Found ${questions.length} questions in QP.`);

  const paperMeta = {
    paper: 'H573/01 Philosophy of Religion',
    year: 2021,
    session: 'October',
    code: 'H573/01'
  };

  const out = {
    paperId: 'ocr-h573-phil-oct21',
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
  console.log('\n✅ OCR Philosophy of Religion samples written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Unhandled error in generate-ocr-phil-samples:', err);
  process.exit(1);
});



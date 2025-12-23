/**
 * Generate synthetic A-star / A / B / C style answers for past paper questions
 * to use when evaluating examiner personas.
 *
 * This script DOES NOT touch the frontend build. It only reads from the vault
 * / exam-json and writes JSON into public/exam-eval for offline analysis.
 *
 * Usage (from project root):
 *   node scripts/generate-exam-samples.cjs
 *
 * Requirements:
 *   - OPENAI_API_KEY in .env
 *   - public/exam-json/aqa-71811-jun22.json (pilot paper)
 *   - AQA-71811-Marking Scheme-JUN22_extracted.txt in the Psychology vault
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot generate exam samples.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const EXAM_JSON_PATH = path.join(ROOT, 'public', 'exam-json', 'aqa-71811-jun22.json');
const MARK_SCHEME_PATH = path.join(
  ROOT,
  'public',
  'vault',
  'ocr-rs',
  'vault',
  'PastPapers',
  'Psychology',
  'AQA-71811-Marking Scheme-JUN22_extracted.txt'
);
const OUTPUT_DIR = path.join(ROOT, 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'aqa-71811-jun22_samples.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

/**
 * Roughly extract the relevant mark scheme slice for a question number
 * using the same pattern as the interactive exam.
 */
function extractMarkSchemeSection(msText, qNumber) {
  try {
    const safeNum = String(qNumber).replace('.', '\\s*\\.\\s*');
    const re = new RegExp(`0\\s*${safeNum}[\\s\\S]*?(?=0\\s*\\d|$)`, 'i');
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
      max_tokens: 1200,
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
You are an AQA AS Psychology (7181/1 – Introductory Topics) exam specialist.
Your task is to manufacture a set of sample student answers for examiner evaluation.

PAPER: ${paperMeta.paper}
QUESTION ${question.number} [${question.marks} marks]
SECTION: ${question.section || 'N/A'}

QUESTION TEXT:
${question.text}

RELEVANT MARK SCHEME EXTRACT (if any):
${markSchemeSection || '(no specific extract available)' }

Generate 3 sample answers aimed at different performance levels:
- One answer that should realistically achieve A* / top-band marks.
- One answer that should realistically achieve a mid B-grade mark.
- One answer that should realistically achieve a mid C-grade mark.

For each answer:
- Write in a natural 17–18 year old student's voice.
- Follow the AQA marking emphasis on AO1 / AO2 / AO3 where relevant.
- Match the approximate depth / length of a real exam answer for ${question.marks} marks.
- Do NOT simply quote the mark scheme; write as a student would.

Return STRICT JSON:
{
  "questionNumber": "${question.number}",
  "maxMarks": ${question.marks},
  "samples": [
    {
      "label": "A*",
      "targetMarks": ${Math.max(question.marks - 1, Math.round(question.marks * 0.78))},
      "rationale": "Why this should be top band based on the mark scheme (around high 70s percent of the available marks).",
      "text": "Full student-style answer..."
    },
    {
      "label": "B",
      "targetMarks": ${Math.round(question.marks * 0.6)},
      "rationale": "Why this should be a solid B-band answer (around low 60s percent).",
      "text": "Full student-style answer..."
    },
    {
      "label": "C",
      "targetMarks": ${Math.round(question.marks * 0.45)},
      "rationale": "Why this should be a mid C-band answer (around mid-40s percent).",
      "text": "Full student-style answer..."
    }
  ]
}`;
}

async function main() {
  console.log('🔎 Generating examiner-eval samples for: AQA 7181/1 – June 2022 Paper 1');
  console.log('  Exam JSON :', EXAM_JSON_PATH);
  console.log('  Mark scheme:', MARK_SCHEME_PATH);

  const examJson = readJson(EXAM_JSON_PATH);
  const msText = readText(MARK_SCHEME_PATH);

  const paperMeta = {
    paper: examJson.paper || 'AS Paper 1 – Introductory Topics in Psychology',
    year: examJson.year || 2022,
    session: examJson.session || 'June',
    code: examJson.code || '7181/1',
  };

  const out = {
    paperId: 'aqa-71811-jun22',
    meta: paperMeta,
    generatedAt: new Date().toISOString(),
    model: OPENAI_MODEL,
    questions: [],
  };

  for (const q of examJson.questions || []) {
    console.log(`\n✏️  Generating samples for Q${q.number} [${q.marks} marks]...`);
    const msSection = extractMarkSchemeSection(msText, q.number);
    const prompt = buildGenerationPrompt(paperMeta, q, msSection);
    try {
      const resp = await callOpenAI(prompt);
      const entry = {
        questionNumber: resp.questionNumber || q.number,
        maxMarks: resp.maxMarks || q.marks,
        section: q.section || null,
        samples: Array.isArray(resp.samples) ? resp.samples : [],
      };
      console.log(`   -> got ${entry.samples.length} samples`);
      out.questions.push(entry);
    } catch (e) {
      console.error(`   ❌ Failed to generate samples for Q${q.number}:`, e.message);
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('\n✅ Sample answers written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Unhandled error in generate-exam-samples:', err);
  process.exit(1);
});



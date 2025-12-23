/**
 * Generate synthetic OCR H573/01 Philosophy of Religion 40-mark questions
 * for offline quality checking.
 *
 * Usage:
 *   node scripts/generate-ocr-phil-questions.cjs
 *
 * Output:
 *   public/exam-eval/ocr-h573-phil_synthetic-questions.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot generate synthetic questions.');
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

const OUTPUT_DIR = path.join(ROOT, 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ocr-h573-phil_synthetic-questions.json');

const TARGET_COUNT = 40; // aim for "dozens" of questions

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function extractRealQuestionStems(qpText, maxChars = 6000) {
  // Very simple: take the lines that look like question stems (e.g. "1* ..." up to "[40]")
  const lines = qpText.split('\n');
  const stems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^(\d+)\*\s+(.+)/);
    if (!m) continue;
    const number = m[1];
    const parts = [m[2].trim()];
    let j = i + 1;
    while (j < lines.length && !/\[40\]/.test(lines[j])) {
      const t = lines[j].trim();
      if (t) parts.push(t);
      j++;
    }
    stems.push(`Q${number}: ${parts.join(' ')}`);
    i = j;
  }

  let buf = stems.join('\n\n');
  if (buf.length > maxChars) {
    buf = buf.slice(0, maxChars);
  }
  return buf;
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
      max_tokens: 2800,
      temperature: 0.6,
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

function buildGenerationPrompt(realStems) {
  return `
You are an OCR A Level Religious Studies question setter for:
  Specification: H573
  Component: H573/01 – Philosophy of Religion

Your job is to propose NEW 40-mark essay questions that look and feel like
genuine OCR H573/01 questions, but are NOT copies or trivial rephrasings of
existing past-paper questions.

You will see EXAMPLE REAL QUESTIONS from a genuine past paper:

===== EXAMPLE REAL QUESTIONS (DO NOT COPY) =====
${realStems}
===== END EXAMPLES =====

Use these examples ONLY as a style and format guide.

Now generate a set of NEW synthetic questions with the following constraints:
- All questions are for H573/01 Philosophy of Religion (A Level).
- Each question is a single long-form essay question worth 40 marks.
- COMMAND WORDS for 40-mark questions MUST be one of:
  - "Evaluate..."
  - "Critically assess..."
  - "To what extent..."
  Do NOT use other command words (such as "Analyse" or "Discuss") for 40-mark essays.
- Each question should integrate AO1 (knowledge/understanding) and AO2 (analysis/evaluation).
- COVERAGE:
  - Some questions focusing on Ancient philosophical influences (Plato, Aristotle).
  - Some on Soul, Mind and Body.
  - Some on Arguments for the existence of God.
  - Some on Religious Experience.
  - Some on Religious Language.
- SPEC LANGUAGE:
  - Where appropriate, use explicit OCR specification terminology, for example:
    - "Plato's Theory of Forms", "Aristotle's four causes", "soul, mind and body"
    - "cosmological argument", "teleological argument", "ontological argument"
    - "verification principle", "falsification principle", "logical positivism"
    - "mystical and numinous religious experiences"
  - Avoid vague paraphrases when a clear specification term exists.
- Do NOT invent content that is clearly outside the OCR H573 Philosophy of Religion specification.
- Avoid simply cloning existing past-paper questions; vary focus, emphasis, or combinations of topics.
- Each question should NOT be a generic "strengths and weaknesses" of an entire topic.
  Instead, target a specific claim, debate, comparison, or tension (for example, a particular
  philosopher's argument, a specific objection, or a defined aspect of religious belief).
- Assume an A-level cohort aiming for grades A–C: questions should expect reference to named
  philosophers, key concepts and sustained evaluation rather than purely descriptive answers.

Return STRICT JSON:
{
  "spec": "OCR H573/01 Philosophy of Religion",
  "totalTarget": ${TARGET_COUNT},
  "questions": [
    {
      "id": "Q1",
      "topicArea": "Ancient philosophical influences",
      "subArea": "Plato and Aristotle on reality",
      "commandWord": "Critically assess", // must be one of: "Evaluate", "Critically assess", "To what extent"
      "text": "Full 40-mark essay question...",
      "marks": 40,
      "intendedAO1Weight": 0.5,
      "intendedAO2Weight": 0.5
    }
  ]
}
`;
}

async function main() {
  console.log('🧩 Generating synthetic OCR H573/01 Philosophy of Religion questions...');
  console.log('  QP source :', QP_PATH);

  const qpText = readText(QP_PATH);
  const realStems = extractRealQuestionStems(qpText);

  const prompt = buildGenerationPrompt(realStems);
  const resp = await callOpenAI(prompt);

  if (!resp.questions || !Array.isArray(resp.questions)) {
    throw new Error('Model response did not contain a "questions" array.');
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        spec: resp.spec || 'OCR H573/01 Philosophy of Religion',
        generatedAt: new Date().toISOString(),
        model: OPENAI_MODEL,
        totalTarget: resp.totalTarget || TARGET_COUNT,
        questions: resp.questions,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`✅ Synthetic questions written to: ${OUTPUT_FILE}`);
  console.log(`   Count: ${resp.questions.length}`);
}

main().catch((err) => {
  console.error('❌ Failed to generate synthetic questions:', err.message);
  process.exit(1);
});



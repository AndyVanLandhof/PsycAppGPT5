/**
 * Generate synthetic extended AQA 7182/3 Paper 3 (Issues and Options) questions
 * for offline quality checking.
 *
 * Usage:
 *   node scripts/generate-aqa-paper3-questions.cjs
 *
 * Output:
 *   public/exam-eval/aqa-71823-paper3_synthetic-questions.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot generate AQA questions.');
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
  'Psychology',
  'June 2019 QP - Paper 3 AQA Psychology A-level_extracted.txt'
);

const OUTPUT_DIR = path.join(ROOT, 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'aqa-71823-paper3_synthetic-questions.json');

const TARGET_COUNT = 40;

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

// Very simple parser: pull out stems for higher-mark (≥16) questions.
function extractExtendedQuestionStems(text, maxChars = 8000) {
  const lines = text.split('\n');
  const stems = [];

  let current = null;
  let buffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const qMatch = line.match(/^(\d+)\s+(.+)/);
    if (qMatch) {
      if (current && buffer.length > 0) {
        current.text = [current.text].concat(buffer).join(' ');
        if (current.marks >= 16) {
          stems.push(`${current.number} (${current.marks} marks): ${current.text}`);
        }
        buffer = [];
      }
      current = {
        number: qMatch[1],
        text: qMatch[2],
        marks: 0
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
    if (current.marks >= 16) {
      stems.push(`${current.number} (${current.marks} marks): ${current.text}`);
    }
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
      max_tokens: 2600,
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
You are an AQA A-level Psychology question setter for:
  Specification: 7182
  Paper 3 – Issues and options in psychology (7182/3).

Your job is to propose NEW extended-mark exam questions (16–24 marks)
that look and feel like genuine AQA 7182/3 Paper 3 questions.

You will see EXAMPLE REAL QUESTIONS from a genuine Paper 3 exam:

===== EXAMPLE REAL EXTENDED QUESTIONS (DO NOT COPY) =====
${realStems}
===== END EXAMPLES =====

Use these only as a style and format guide.

Constraints for your NEW questions:
- Each question should be a long-form response (16, 20 or 24 marks).
- Use AQA-style command words for extended questions, such as:
  - "Discuss..."
  - "Evaluate..."
  - "To what extent..."
- Integrate AO1 (knowledge/understanding) and AO2/AO3 (application, analysis, evaluation, issues and debates).
- Cover a spread of Paper 3 areas, for example:
  - Issues and debates (e.g. gender bias, culture bias, free will vs determinism, nature–nurture).
  - Options topics (e.g. relationships, schizophrenia, forensic psychology), but you may stay general at the 'Issues and options' level.
- Avoid trivial or purely descriptive questions – each should require substantial analysis/evaluation.
- Do NOT clone existing AQA questions; vary focus, specific angles, or combinations of issues.

Return STRICT JSON:
{
  "spec": "AQA 7182/3 Issues and options in psychology",
  "totalTarget": ${TARGET_COUNT},
  "questions": [
    {
      "id": "Q1",
      "topicArea": "Issues and debates",
      "subArea": "Gender bias in psychological research",
      "marks": 16,
      "commandWord": "Discuss",
      "text": "Full extended-mark question text...",
      "intendedAO1Weight": 0.5,
      "intendedAO2Weight": 0.5
    }
  ]
}
`;
}

async function main() {
  console.log('🧩 Generating synthetic AQA 7182/3 Paper 3 questions...');
  console.log('  QP source :', QP_PATH);

  const qpText = readText(QP_PATH);
  const realStems = extractExtendedQuestionStems(qpText);

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
        spec: resp.spec || 'AQA 7182/3 Issues and options in psychology',
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

  console.log(`✅ Synthetic AQA questions written to: ${OUTPUT_FILE}`);
  console.log(`   Count: ${resp.questions.length}`);
}

main().catch((err) => {
  console.error('❌ Failed to generate AQA questions:', err.message);
  process.exit(1);
});



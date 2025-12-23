/**
 * Generate synthetic Edexcel 9ET0/03 Paper 3 (Poetry) questions
 * for offline quality checking.
 *
 * Usage:
 *   node scripts/generate-englit-questions.cjs
 *
 * Output:
 *   public/exam-eval/edexcel-9et0-p3_synthetic-questions.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot generate Edexcel questions.');
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

const OUTPUT_DIR = path.join(ROOT, 'public', 'exam-eval');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'edexcel-9et0-p3_synthetic-questions.json');
const TARGET_COUNT = 30;

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function extractPoetryQuestionStems(text, maxChars = 8000) {
  const lines = text.split('\n');
  const stems = [];
  let current = null;
  let buffer = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const qMatch = line.match(/^Question\s+(\d+)\s*(.+)?$/i);
    if (qMatch) {
      if (current && buffer.length > 0) {
        current.text = buffer.join(' ');
        stems.push(`Question ${current.number}: ${current.text}`);
        buffer = [];
      }
      current = {
        number: qMatch[1],
        text: qMatch[2] || ''
      };
      continue;
    }

    const marksMatch = line.match(/\(Total for Question \d+ = (\d+)\s*marks\)/i);
    if (marksMatch && current) {
      // we don't need marks here, just treat this as the end of the stem block
      continue;
    }

    if (current && line) {
      buffer.push(line);
    }
  }

  if (current && buffer.length > 0) {
    current.text = buffer.join(' ');
    stems.push(`Question ${current.number}: ${current.text}`);
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
You are an Edexcel A-level English Literature question setter for:
  Specification: 9ET0
  Paper 3: Poetry (9ET0/03).

Your job is to propose NEW poetry exam questions that look and feel like
genuine Edexcel 9ET0/03 questions, but are not copies of existing ones.

You will see EXAMPLE REAL QUESTION STEMS from June 2019:

===== EXAMPLE REAL QUESTIONS (DO NOT COPY) =====
${realStems}
===== END EXAMPLES =====

Use these examples only as a style guide.

Constraints:
- Each question should be a full 30-mark poetry question, requiring close analysis of a named text or anthology selection plus comparative or interpretative work as in Paper 3.
- Use Edexcel-style command words and phrasing (e.g. "Explore the significance of...", "To what extent...", "Compare the ways in which...").
- Integrate AO1–AO4 expectations:
  - AO1: coherent argument and terminology.
  - AO2: analysis of language, form and structure.
  - AO3: contexts and interpretations.
  - AO4: connections/comparisons (where appropriate).
- Assume texts from "Poems of the Decade" and Keats as the core taught texts.
- Do NOT invent new texts; refer only to plausible set texts or to 'given poem / unseen poem' language as in the real paper.
- Avoid trivial or purely descriptive questions; each question should demand genuine critical analysis.

Return STRICT JSON:
{
  "spec": "Edexcel 9ET0/03 Paper 3: Poetry",
  "totalTarget": ${TARGET_COUNT},
  "questions": [
    {
      "id": "Q1",
      "topicArea": "Poems of the Decade",
      "subArea": "Power and conflict",
      "marks": 30,
      "commandWord": "Explore",
      "text": "Full 30-mark poetry question...",
      "intendedAO1Weight": 0.25,
      "intendedAO2Weight": 0.35,
      "intendedAO3Weight": 0.2,
      "intendedAO4Weight": 0.2
    }
  ]
}
`;
}

async function main() {
  console.log('🧩 Generating synthetic Edexcel 9ET0/03 Poetry questions...');
  console.log('  QP source :', QP_PATH);

  const qpText = readText(QP_PATH);
  const realStems = extractPoetryQuestionStems(qpText);

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
        spec: resp.spec || 'Edexcel 9ET0/03 Poetry',
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

  console.log(`✅ Synthetic Edexcel questions written to: ${OUTPUT_FILE}`);
  console.log(`   Count: ${resp.questions.length}`);
}

main().catch((err) => {
  console.error('❌ Failed to generate Edexcel questions:', err.message);
  process.exit(1);
});



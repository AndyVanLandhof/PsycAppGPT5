/**
 * Build AQA Psychology examiner profile for AS Paper 2 (7181/2 – Psychology in Context)
 *
 * Usage:
 *   node scripts/build-aqa-examiner-profile-paper2.cjs
 *
 * Requires:
 *   - OPENAI_API_KEY in .env
 *   - Extracted question papers and mark schemes in:
 *     public/vault/ocr-rs/vault/PastPapers/Psychology
 *     with filenames containing:
 *       - AQA-71812-QP-..._extracted.txt  (Paper 2 QPs)
 *       - AQA-71812-Marking Scheme-..._extracted.txt or AQA-71812-W-Marking Scheme-..._extracted.txt
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.EXAMINER_MODEL || 'gpt-4o';
const MAX_TOKENS = 2200;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in .env – cannot build examiner profile.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..', 'public', 'vault', 'ocr-rs', 'vault', 'PastPapers', 'Psychology');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'exam-profiles');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'aqa-psych_paper2-context.json');

function collectFiles() {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('_extracted.txt'));

  const paper2QPs = [];
  const paper2MS = [];

  for (const file of files) {
    // AS Paper 2 (7181/2 – Psychology in Context)
    if (file.includes('AQA-71812-QP-')) {
      paper2QPs.push(path.join(ROOT, file));
    } else if (file.includes('AQA-71812-Marking Scheme-') || file.includes('AQA-71812-W-Marking Scheme-')) {
      paper2MS.push(path.join(ROOT, file));
    }
  }

  return { paper2QPs, paper2MS };
}

function readAndConcat(files, label, maxChars = 16000) {
  if (!files.length) return '';
  let buf = `===== ${label.toUpperCase()} START =====\n`;
  for (const file of files) {
    if (buf.length >= maxChars) break;
    try {
      let content = fs.readFileSync(file, 'utf8');
      if (buf.length + content.length > maxChars) {
        content = content.slice(0, maxChars - buf.length);
      }
      buf += `\n\n--- FILE: ${path.basename(file)} ---\n\n`;
      buf += content;
    } catch (e) {
      console.warn(`⚠️ Failed to read ${file}: ${e.message}`);
    }
  }
  buf += `\n===== ${label.toUpperCase()} END =====\n`;
  return buf;
}

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: MAX_TOKENS,
      temperature: 0.4,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse JSON response: ${content.slice(0, 200)}...`);
  }
}

function buildPrompt(papersText, schemesText) {
  return `
You are a senior AQA Psychology 7181/2 examiner trainer.
Your job is to create a concise but rich \"examiner profile\" for:

  Paper: AS Psychology Paper 2 – Psychology in Context
  Board: AQA
  Code: 7181/2

You will see:
- Several QUESTION PAPERS (multiple years/series)
- Their corresponding MARK SCHEMES

Use ALL of this to infer how this paper is actually marked in real exams.

${papersText}

${schemesText}

Now produce a SINGLE JSON object capturing how to behave like an AQA AS Psychology Paper 2 examiner.

Be precise, exam-board realistic, and focus on what matters for marking, especially AO1/AO2/AO3 balance, and typical student performance.

STRICT JSON ONLY with this shape:
{
  "examBoard": "AQA",
  "subject": "Psychology",
  "paper": "AS Paper 2 – Psychology in Context",
  "syllabusCode": "7181/2",
  "papersSampled": ["brief list of paper identifiers or filenames"],
  "markingPrinciples": [
    "high-level principles used by examiners when awarding marks on this paper"
  ],
  "aoEmphasis": {
    "AO1": "How AO1 is judged here (knowledge/understanding – theories, approaches, biological bases, methods)",
    "AO2": "How AO2 is judged here (application to scenarios, research methods, data)",
    "AO3": "How AO3 is judged here (analysis/evaluation – issues, debates, methodology, strengths/limitations)"
  },
  "levelDescriptorsSummary": [
    "Plain-English summary of what distinguishes low/mid/high bands for typical 8- and 16-mark questions on this paper"
  ],
  "commonStrengths": [
    "Things stronger candidates often do well, as seen in mark schemes (and implied reports if present)"
  ],
  "commonWeaknesses": [
    "Frequent mistakes / weaknesses examiners complain about or that appear in lower-band mark scheme guidance"
  ],
  "topBandAdvice": [
    "Concrete tips for writing a top-band answer in this paper"
  ],
  "typicalQuestionTypes": [
    "Summary of common question stems and what they are really asking for (e.g. 16-mark evaluate approaches, 8-mark discuss biological explanations, methods questions, etc.)"
  ],
  "feedbackTone": "How feedback should sound (e.g. firm but supportive, exam-technique focused, specific about AO1/AO2/AO3)"
}
`;
}

async function main() {
  console.log('🔎 Building AQA Psychology examiner profile: AS Paper 2 – Psychology in Context');
  console.log(`  Root: ${ROOT}`);

  const { paper2QPs, paper2MS } = collectFiles();

  if (!paper2QPs.length || !paper2MS.length) {
    console.error('❌ Missing question papers or mark schemes for AQA 7181/2.');
    console.error('   QPs:', paper2QPs.length);
    console.error('   MS :', paper2MS.length);
    process.exit(1);
  }

  console.log(`  Found ${paper2QPs.length} question papers, ${paper2MS.length} mark schemes.`);

  const papersText = readAndConcat(paper2QPs, 'Question Papers');
  const schemesText = readAndConcat(paper2MS, 'Mark Schemes');

  const prompt = buildPrompt(papersText, schemesText);

  console.log('📡 Calling OpenAI to build AQA Paper 2 examiner profile...');
  const profile = await callOpenAI(prompt);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(profile, null, 2), 'utf8');

  console.log('✅ AQA Paper 2 examiner profile written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Failed to build AQA Paper 2 examiner profile:', err.message);
  process.exit(1);
});



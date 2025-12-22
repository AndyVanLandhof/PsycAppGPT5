/**
 * Build OCR RS examiner profile for Philosophy of Religion
 *
 * Usage:
 *   node scripts/build-ocr-examiner-profile.cjs
 *
 * Requires:
 *   - OPENAI_API_KEY in .env
 *   - Extracted past papers, mark schemes and examiners' reports in:
 *     public/vault/ocr-rs/vault/PastPapers/Religious Studies
 *     with filenames containing:
 *       - question-paper-philosophy-of-religion_extracted.txt
 *       - mark-scheme-philosophy-of-religion_extracted.txt
 *       - examiners-report-philosophy-of-religion_extracted.txt
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

const ROOT = path.join(__dirname, '..', 'public', 'vault', 'ocr-rs', 'vault', 'PastPapers', 'Religious Studies');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'exam-profiles');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ocr-rs_philosophy-of-religion.json');

function collectFiles() {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('_extracted.txt'));

  const questionPapers = [];
  const markSchemes = [];
  const reports = [];

  for (const file of files) {
    if (!file.includes('philosophy-of-religion')) continue;
    const fullPath = path.join(ROOT, file);
    if (file.includes('question-paper')) {
      questionPapers.push(fullPath);
    } else if (file.includes('mark-scheme')) {
      markSchemes.push(fullPath);
    } else if (file.includes('examiners-report')) {
      reports.push(fullPath);
    }
  }

  return { questionPapers, markSchemes, reports };
}

function readAndConcat(files, label, maxChars = 16000) {
  if (!files.length) return '';
  let buf = `===== ${label.toUpperCase()} START =====\n`;
  for (const file of files) {
    if (buf.length >= maxChars) break;
    try {
      let content = fs.readFileSync(file, 'utf8');
      // Trim very long content if needed
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

function buildPrompt(papersText, schemesText, reportsText) {
  return `
You are a senior OCR Religious Studies H573 examiner trainer.
Your job is to create a concise but rich \"examiner profile\" for the component:

  Component: Philosophy of Religion
  Qualification: A Level Religious Studies (H573)

You will see:
- Several QUESTION PAPERS for Philosophy of Religion
- Their corresponding MARK SCHEMES
- Several EXAMINERS' REPORTS for Philosophy of Religion

Use ALL of this to infer how this component is actually marked in real exams.

${papersText}

${schemesText}

${reportsText}

Now produce a SINGLE JSON object capturing how to behave like an OCR H573 Philosophy of Religion examiner.

Be precise, exam-board realistic, and focus on what matters for marking.

STRICT JSON ONLY with this shape:
{
  "examBoard": "OCR",
  "subject": "Religious Studies",
  "component": "Philosophy of Religion",
  "syllabusCode": "H573",
  "papersSampled": ["brief list of paper identifiers or filenames"],
  "markingPrinciples": [
    "high-level principles used by examiners when awarding marks"
  ],
  "aoEmphasis": {
    "AO1": "How AO1 is judged here (knowledge/understanding)",
    "AO2": "How AO2 is judged here (analysis/evaluation)"
  },
  "levelDescriptorsSummary": [
    "Plain-English summary of what distinguishes low/mid/high bands"
  ],
  "commonStrengths": [
    "Things stronger candidates often do well, as seen in reports"
  ],
  "commonWeaknesses": [
    "Frequent mistakes / weaknesses examiners complain about"
  ],
  "topBandAdvice": [
    "Concrete tips for writing a top-band answer in this component"
  ],
  "typicalQuestionTypes": [
    "Summary of common question stems and what they are really asking for"
  ],
  "feedbackTone": "How feedback should sound (e.g. firm but encouraging, specific, exam-focused)"
}
`;
}

async function main() {
  console.log('🔎 Building OCR RS examiner profile: Philosophy of Religion');
  console.log(`  Root: ${ROOT}`);

  const { questionPapers, markSchemes, reports } = collectFiles();

  if (!questionPapers.length || !markSchemes.length || !reports.length) {
    console.error('❌ Missing one or more types of files for Philosophy of Religion.');
    console.error('   Question papers:', questionPapers.length);
    console.error('   Mark schemes   :', markSchemes.length);
    console.error('   Reports        :', reports.length);
    process.exit(1);
  }

  console.log(`  Found ${questionPapers.length} question papers, ${markSchemes.length} mark schemes, ${reports.length} reports.`);

  const papersText = readAndConcat(questionPapers, 'Question Papers');
  const schemesText = readAndConcat(markSchemes, 'Mark Schemes');
  const reportsText = readAndConcat(reports, 'Examiners Reports');

  const prompt = buildPrompt(papersText, schemesText, reportsText);

  console.log('📡 Calling OpenAI to build examiner profile...');
  const profile = await callOpenAI(prompt);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(profile, null, 2), 'utf8');

  console.log('✅ Examiner profile written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Failed to build examiner profile:', err.message);
  process.exit(1);
});



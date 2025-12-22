/**
 * Build Edexcel English Literature A-level examiner profile (9ET0)
 *
 * Usage:
 *   node scripts/build-edexcel-englit-examiner-profile.cjs
 *
 * Requires:
 *   - OPENAI_API_KEY in .env
 *   - Extracted question papers and mark schemes in:
 *     public/vault/ocr-rs/vault/PastPapers/English Literature
 *     with filenames like:
 *       "June 2022 QP - Paper 1 Edexcel English Literature A-level_extracted.txt"
 *       "June 2022 MS - Paper 1 Edexcel English Literature A-level_extracted.txt"
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

const ROOT = path.join(__dirname, '..', 'public', 'vault', 'ocr-rs', 'vault', 'PastPapers', 'English Literature');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'exam-profiles');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'edexcel-englit_9et0-all-papers.json');

function collectFiles() {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('_extracted.txt'));

  const qps = [];
  const mss = [];

  for (const file of files) {
    if (file.includes('QP - Paper')) {
      qps.push(path.join(ROOT, file));
    } else if (file.includes('MS - Paper')) {
      mss.push(path.join(ROOT, file));
    }
  }

  return { qps, mss };
}

function readAndConcat(files, label, maxChars = 20000) {
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
You are a senior Edexcel A-level English Literature (9ET0) examiner trainer.
Your job is to create a concise but rich "examiner profile" for the overall 9ET0 specification
covering Paper 1 (Drama), Paper 2 (Prose), and Paper 3 (Poetry / unseen / coursework-style tasks).

You will see:
- Several QUESTION PAPERS (multiple years/series across Papers 1–3)
- Their corresponding MARK SCHEMES

Use ALL of this to infer how these papers are actually marked in real exams.

${papersText}

${schemesText}

Now produce a SINGLE JSON object capturing how to behave like an Edexcel 9ET0 examiner.

Be precise, exam-board realistic, and focus on what matters for marking, especially AO1–AO4, and typical student performance.

STRICT JSON ONLY with this shape:
{
  "examBoard": "Edexcel",
  "subject": "English Literature",
  "specCode": "9ET0",
  "papersCovered": ["Paper 1 Drama", "Paper 2 Prose", "Paper 3 Poetry and unseen"],
  "markingPrinciples": [
    "high-level principles used by examiners when awarding marks on these papers"
  ],
  "aoEmphasis": {
    "AO1": "How AO1 (articulate informed, personal responses, use of critical views, coherent written expression) is judged",
    "AO2": "How AO2 (analysis of form, structure, language) is judged",
    "AO3": "How AO3 (contexts, interpretations) is judged",
    "AO4": "How AO4 (connections/comparisons across texts) is judged"
  },
  "levelDescriptorsSummary": [
    "Plain-English summary of what distinguishes low/mid/high bands for typical 20/25-mark essays on these papers"
  ],
  "commonStrengths": [
    "Things stronger candidates often do well (close analysis, integration of quotes, conceptualised argument, etc.)"
  ],
  "commonWeaknesses": [
    "Frequent mistakes / weaknesses examiners complain about (narration, weak AO2, bolt-on context, etc.)"
  ],
  "topBandAdvice": [
    "Concrete tips for writing a top-band answer in each paper (Drama, Prose, Poetry)"
  ],
  "typicalQuestionTypes": [
    "Summary of common essay stems and what they are really asking for (e.g. AO weighting, focus on character vs theme vs technique)"
  ],
  "feedbackTone": "How feedback should sound (e.g. firm but supportive, literary-critical, specific about AO1–AO4 and precision of analysis)"
}
`;
}

async function main() {
  console.log('🔎 Building Edexcel English Literature examiner profile (9ET0 – all papers)');
  console.log(`  Root: ${ROOT}`);

  const { qps, mss } = collectFiles();

  if (!qps.length || !mss.length) {
    console.error('❌ Missing question papers or mark schemes for Edexcel English Literature 9ET0.');
    console.error('   QPs:', qps.length);
    console.error('   MS :', mss.length);
    process.exit(1);
  }

  console.log(`  Found ${qps.length} question papers, ${mss.length} mark schemes.`);

  const papersText = readAndConcat(qps, 'Question Papers');
  const schemesText = readAndConcat(mss, 'Mark Schemes');

  const prompt = buildPrompt(papersText, schemesText);

  console.log('📡 Calling OpenAI to build Edexcel English Literature examiner profile...');
  const profile = await callOpenAI(prompt);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(profile, null, 2), 'utf8');

  console.log('✅ Edexcel English Literature examiner profile written to:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('❌ Failed to build Edexcel English Literature examiner profile:', err.message);
  process.exit(1);
});



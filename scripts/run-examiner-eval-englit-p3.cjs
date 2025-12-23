/**
 * Run examiner evaluation for Edexcel A-level English Literature
 * 9ET0/03 – Paper 3: Poetry (June 2019).
 *
 * Uses:
 *   - Samples from public/exam-eval/edexcel-9et0-p3-jun19_samples.json
 *   - Mark scheme from June 2019 MS - Paper 3 Edexcel English Literature A-level_extracted.txt
 *
 * Usage:
 *   node scripts/run-examiner-eval-englit-p3.cjs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219';

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is not set in .env – cannot run Edexcel examiner eval.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const SAMPLES_FILE = path.join(ROOT, 'public', 'exam-eval', 'edexcel-9et0-p3-jun19_samples.json');
const MARK_SCHEME_PATH = path.join(
  ROOT,
  'public',
  'vault',
  'ocr-rs',
  'vault',
  'PastPapers',
  'English Literature',
  'June 2019 MS - Paper 3 Edexcel English Literature A-level_extracted.txt'
);
// Write to a V2 report file so the original baseline is preserved
const REPORT_FILE = path.join(ROOT, 'public', 'exam-eval', 'edexcel-9et0-p3-jun19_report_v2.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
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

async function callAnthropic(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 900,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = (data.content && data.content[0] && data.content[0].text) || '';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse JSON from Anthropic response: ${text.slice(0, 200)}...`);
  }
}

function buildExaminerPrompt(paperMeta, question, sample, markSchemeSection) {
  return `
You are acting as an Edexcel A-level English Literature examiner for specification 9ET0,
Paper 3: Poetry (9ET0/03).

You must mark a SINGLE student answer fairly and realistically, following
Edexcel's AO1–AO4 marking principles and the official mark scheme for this question.

PAPER: ${paperMeta.paper}
CODE: ${paperMeta.code}
YEAR/SESSION: ${paperMeta.year} ${paperMeta.session}

QUESTION ${question.questionNumber} [${question.maxMarks} marks]
SECTION: ${question.section || 'Poetry'}

QUESTION TEXT:
${question.text}

STUDENT ANSWER (labelled during generation as approximately ${sample.label}-grade):
${sample.text}

RELEVANT MARK SCHEME EXTRACT (truncated if long):
${markSchemeSection ? markSchemeSection.substring(0, 3500) : '(none available)'}

Mark strictly according to Edexcel 9ET0/03 Poetry marking criteria (AO1–AO4).

MARKING INSTRUCTIONS:
1. Use the LEVEL DESCRIPTORS from the mark scheme to determine the level (if provided).
2. Use the indicative content as a guide, but DO NOT award marks for material that is not explicitly present in the answer.
3. DO NOT infer student intent; only credit what is actually written.
4. If the answer sits between two levels, use a best fit judgement across the descriptors; only move into a higher band when there is clear, sustained evidence, but do not look for excuses to mark down.
5. Make a short separate judgement on AO1 (knowledge/understanding and argument), AO2 (analysis of language/form/structure), AO3 (contexts/interpretations) and AO4 (connections/comparisons, where relevant).
6. Briefly explain why this answer is NOT in the next higher level.

RETURN STRICT JSON:
{
  "awarded": <integer 0 to ${question.maxMarks}>,
  "levelDescriptor": "Plain English description of the level (e.g. mid Level 5) and why",
  "feedback": "Short summary of why this mark was awarded",
  "strengths": ["Specific positive points"],
  "improvements": ["Specific weaknesses or what is missing"],
  "ao1Comment": "Short comment on AO1 performance",
  "ao2Comment": "Short comment on AO2 performance",
  "ao3Comment": "Short comment on AO3 performance",
  "ao4Comment": "Short comment on AO4 performance (if applicable)",
  "whyNotNextLevel": "One or two sentences explaining why this is not in the next higher level"
}
`;
}

async function main() {
  console.log('🔎 Running Edexcel 9ET0/03 Poetry examiner eval (June 2019)');
  console.log('  Samples file :', SAMPLES_FILE);
  console.log('  Mark scheme  :', MARK_SCHEME_PATH);

  const samples = readJson(SAMPLES_FILE);
  const msText = readText(MARK_SCHEME_PATH);

  const paperMeta = samples.meta || {
    paper: '9ET0/03 Paper 3: Poetry',
    code: '9ET0/03',
    year: 2019,
    session: 'June'
  };

  const results = [];

  for (const q of samples.questions || []) {
    const msSection = extractMarkSchemeSection(msText, q.questionNumber);

    for (const sample of q.samples || []) {
      const effectiveQuestion = {
        questionNumber: q.questionNumber,
        maxMarks: q.maxMarks,
        text: sample.questionText || '(question text not embedded in samples JSON)',
        section: q.section || 'Poetry'
      };

      const fullPrompt = buildExaminerPrompt(paperMeta, effectiveQuestion, sample, msSection);

      console.log(`\n🧪 Marking Q${q.questionNumber} sample [${sample.label}] ...`);
      try {
        const mark = await callAnthropic(fullPrompt);
        const awarded = typeof mark.awarded === 'number' ? mark.awarded : 0;
        const diff = awarded - (sample.targetMarks || 0);
        console.log(`   -> target ${sample.targetMarks}, examiner ${awarded} (diff ${diff})`);

        results.push({
          paperId: samples.paperId,
          questionNumber: q.questionNumber,
          label: sample.label,
          targetMarks: sample.targetMarks,
          awarded,
          diff,
          levelDescriptor: mark.levelDescriptor || '',
          feedback: mark.feedback || '',
          strengths: mark.strengths || [],
          improvements: mark.improvements || []
        });
      } catch (e) {
        console.error(`   ❌ Error marking Q${q.questionNumber} sample [${sample.label}]:`, e.message);
        results.push({
          paperId: samples.paperId,
          questionNumber: q.questionNumber,
          label: sample.label,
          targetMarks: sample.targetMarks,
          awarded: null,
          diff: null,
          error: e.message
        });
      }
    }
  }

  // Aggregate metrics
  const summary = {
    paperId: samples.paperId,
    model: ANTHROPIC_MODEL,
    totalSamples: results.length,
    byLabel: {},
    global: {
      count: 0,
      meanAbsError: null
    }
  };

  let absErrorSum = 0;
  let absErrorCount = 0;

  for (const r of results) {
    if (typeof r.awarded === 'number' && typeof r.targetMarks === 'number') {
      const absDiff = Math.abs(r.diff);
      absErrorSum += absDiff;
      absErrorCount += 1;
    }
    const bucket = summary.byLabel[r.label] || { count: 0, meanDiff: null, sumDiff: 0, awarded: [], target: [] };
    bucket.count += 1;
    if (typeof r.diff === 'number') {
      bucket.sumDiff += r.diff;
      bucket.awarded.push(r.awarded);
      bucket.target.push(r.targetMarks);
    }
    summary.byLabel[r.label] = bucket;
  }

  summary.global.count = absErrorCount;
  summary.global.meanAbsError = absErrorCount > 0 ? absErrorSum / absErrorCount : null;
  for (const label of Object.keys(summary.byLabel)) {
    const b = summary.byLabel[label];
    if (b.count > 0 && b.awarded.length > 0) {
      b.meanDiff = b.sumDiff / b.awarded.length;
    }
  }

  const report = {
    meta: paperMeta,
    generatedAt: new Date().toISOString(),
    summary,
    results
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log('\n✅ Edexcel Poetry examiner evaluation report written to:', REPORT_FILE);
  console.log('   Global mean absolute error (marks):', summary.global.meanAbsError);
}

main().catch((err) => {
  console.error('❌ Unhandled error in run-examiner-eval-englit-p3:', err);
  process.exit(1);
});



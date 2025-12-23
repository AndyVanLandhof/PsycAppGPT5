/**
 * Run examiner persona evaluation against pre-generated sample answers.
 *
 * This script:
 *   - Reads samples from public/exam-eval/aqa-71811-jun22_samples.json
 *   - Sends each sample answer to the examiner persona (Claude, or whatever
 *     ANTHROPIC_MODEL you configure) using a prompt very similar to the
 *     InteractiveExam flow.
 *   - Compares awarded marks vs targetMarks and writes a report.
 *
 * It DOES NOT modify frontend code or the build.
 *
 * Usage:
 *   node scripts/run-examiner-eval.cjs
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY in .env
 *   - public/exam-eval/aqa-71811-jun22_samples.json (from generate-exam-samples)
 *   - public/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-Marking Scheme-JUN22_extracted.txt
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219';

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is not set in .env – cannot run examiner eval.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const SAMPLES_FILE = path.join(ROOT, 'public', 'exam-eval', 'aqa-71811-jun22_samples.json');
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
const REPORT_FILE = path.join(ROOT, 'public', 'exam-eval', 'aqa-71811-jun22_report.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

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
      max_tokens: 800,
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
You are acting as an AQA AS Psychology (7181/1 – Introductory Topics) examiner.
You have been "trained" on this paper's mark schemes and examiner reports. Now
you must mark a SINGLE student answer as fairly and realistically as possible.

PAPER: ${paperMeta.paper}
CODE: ${paperMeta.code}
YEAR/SESSION: ${paperMeta.year} ${paperMeta.session}

QUESTION ${question.questionNumber} [${question.maxMarks} marks]
SECTION: ${question.section || 'N/A'}

QUESTION TEXT:
${question.text}

STUDENT ANSWER (labelled as approximately ${sample.label}-grade during generation):
${sample.text}

RELEVANT MARK SCHEME EXTRACT (truncated if long):
${markSchemeSection ? markSchemeSection.substring(0, 3500) : '(none available)'}

Mark strictly according to AQA AS Psychology marking principles for this paper.

MARKING INSTRUCTIONS:
1. Use the LEVEL DESCRIPTORS from the mark scheme to determine the level (if provided).
2. Check the POSSIBLE CONTENT list – credit valid points even if not listed ("Credit other relevant content").
3. Apply the specific marking rules (e.g. "Just naming X is not creditworthy").
4. DO NOT infer student intent or award marks for material that is not explicitly present in the answer.
5. If the answer sits between two levels, use a best fit judgement across the descriptors; only move into a higher band when there is clear, sustained evidence, but do not look for excuses to mark down.
6. Be fair but rigorous – partial credit for partial answers.
7. Make a short separate judgement on AO1 (knowledge/understanding) and AO2 (application/analysis/evaluation).
8. Briefly explain why this answer is NOT in the next higher level.

RETURN STRICT JSON:
{
  "awarded": <integer 0 to ${question.maxMarks}>,
  "levelDescriptor": "Plain English description of the level (e.g. mid Level 3) and why",
  "feedback": "Short summary of why this mark was awarded",
  "strengths": ["Specific positive points"],
  "improvements": ["Specific weaknesses or what is missing"],
  "ao1Comment": "Short comment on AO1 performance (knowledge/understanding only)",
  "ao2Comment": "Short comment on AO2 performance (application/analysis/evaluation)",
  "whyNotNextLevel": "One or two sentences explaining why this is not in the next higher level"
}
`;
}

async function main() {
  console.log('🔎 Running examiner evaluation for: AQA 7181/1 – June 2022 Paper 1');
  console.log('  Samples file :', SAMPLES_FILE);
  console.log('  Mark scheme  :', MARK_SCHEME_PATH);

  const samples = readJson(SAMPLES_FILE);
  const msText = readText(MARK_SCHEME_PATH);

  const paperMeta = samples.meta || {
    paper: 'AS Paper 1 – Introductory Topics in Psychology',
    code: '7181/1',
    year: 2022,
    session: 'June'
  };

  const results = [];

  for (const q of samples.questions || []) {
    const msSection = extractMarkSchemeSection(msText, q.questionNumber);

    for (const sample of q.samples || []) {
      const prompt = buildExaminerPrompt(paperMeta, {
        questionNumber: q.questionNumber,
        maxMarks: q.maxMarks,
        text: sample.text ? undefined : '(question not repeated here)',
        section: q.section || null,
        // Note: we can include the question text later from exam-json if needed.
      }, sample, msSection);

      // Use question text from the sample bundle if present; otherwise we leave as generic.
      const effectiveQuestion = {
        questionNumber: q.questionNumber,
        maxMarks: q.maxMarks,
        text: sample.questionText || '(question text not embedded in samples JSON)',
        section: q.section || null
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

  // Aggregate basic metrics
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
  console.log('\n✅ Examiner evaluation report written to:', REPORT_FILE);
  console.log('   Global mean absolute error (marks):', summary.global.meanAbsError);
}

main().catch((err) => {
  console.error('❌ Unhandled error in run-examiner-eval:', err);
  process.exit(1);
});



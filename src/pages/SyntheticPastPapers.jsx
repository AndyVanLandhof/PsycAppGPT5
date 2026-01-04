import React, { useState } from 'react';
import { Sparkles, Clock, Play, CheckCircle, Loader2 } from 'lucide-react';
import { getSelectedCurriculum } from '../config/curricula';
import { useAIService } from '../hooks/useAIService';
import SyntheticExam from './SyntheticExam.jsx';

// Paper configurations by curriculum
// durationMinutes is used for the timed SyntheticExam; duration is the display label.
const PAPER_CONFIG = {
  'aqa-psych': {
    examBoard: 'AQA',
    subject: 'Psychology',
    code: '7182',
    papers: [
      {
        id: 'paper1',
        name: 'Paper 1: Introductory Topics',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 96,
        paperCode: '7182/1',
        topics: ['Social Influence', 'Memory', 'Attachment', 'Psychopathology']
      },
      {
        id: 'paper2',
        name: 'Paper 2: Psychology in Context',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 96,
        paperCode: '7182/2',
        topics: ['Approaches', 'Biopsychology', 'Research Methods']
      },
      {
        id: 'paper3',
        name: 'Paper 3: Issues and Options',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 96,
        paperCode: '7182/3',
        topics: ['Issues and Debates', 'Relationships', 'Schizophrenia', 'Forensic Psychology']
      },
    ]
  },
  'ocr-rs': {
    examBoard: 'OCR',
    subject: 'Religious Studies',
    code: 'H573',
    papers: [
      {
        id: 'paper1',
        name: 'Paper 1: Philosophy of Religion',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 120,
        paperCode: 'H573/01',
        questionsToAnswer: 3, // mirror "answer 3 of 4" behaviour
        topics: ['Ancient Philosophical Influences', 'Soul, Mind and Body', 'Arguments for God', 'Religious Experience', 'Religious Language']
      },
      {
        id: 'paper2',
        name: 'Paper 2: Religion and Ethics',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 120,
        paperCode: 'H573/02',
        topics: ['Natural Law', 'Situation Ethics', 'Kantian Ethics', 'Utilitarianism', 'Euthanasia', 'Business Ethics']
      },
      {
        id: 'paper3',
        name: 'Paper 3: Developments in Christian Thought',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 120,
        paperCode: 'H573/03',
        topics: ['Augustine', 'Death and Afterlife', 'Knowledge of God', 'Jesus Christ', 'Pluralism', 'Secularism']
      },
    ]
  },
  'edexcel-englit': {
    examBoard: 'Edexcel',
    subject: 'English Literature',
    code: '9ET0',
    papers: [
      {
        id: 'paper1',
        name: 'Paper 1: Drama',
        duration: '2 hours 15 mins',
        durationMinutes: 135,
        marks: 60,
        paperCode: '9ET0/01',
        topics: ['Hamlet', 'Waiting for Godot', 'Tragedy/Comedy Critical Anthology']
      },
      {
        id: 'paper2',
        name: 'Paper 2: Prose',
        duration: '1 hour 15 mins',
        durationMinutes: 75,
        marks: 40,
        paperCode: '9ET0/02',
        topics: ['Heart of Darkness', 'The Lonely Londoners', 'Comparative Themes']
      },
      {
        id: 'paper3',
        name: 'Paper 3: Poetry',
        duration: '2 hours 15 mins',
        durationMinutes: 135,
        marks: 60,
        paperCode: '9ET0/03',
        topics: ['Poems of the Decade', 'Keats Selected Poems', 'Unseen Poetry']
      },
    ]
  }
};

function SyntheticPastPapers({ onBack }) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const config = PAPER_CONFIG[curriculum] || PAPER_CONFIG['aqa-psych'];
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startExam, setStartExam] = useState(false);
  const { callAIWithPublicSources } = useAIService();
  // Free Question state
  const [fqQuestion, setFqQuestion] = useState('');
  const [fqMarks, setFqMarks] = useState(16);
  const [fqAnswer, setFqAnswer] = useState('');
  const [fqResult, setFqResult] = useState(null);
  const [fqError, setFqError] = useState('');
  const [fqLoading, setFqLoading] = useState(false);

  const generatePaper = async (paper) => {
    setSelectedPaper(paper);
    setLoading(true);
    setGeneratedPaper(null);
    setStartExam(false);

    try {
      const isAqa = curriculum === 'aqa-psych';
      const isOcr = curriculum === 'ocr-rs';
      const isEng = curriculum === 'edexcel-englit';

      let styleHint = '';
      if (isAqa) {
        styleHint = `
- Include a mix of short answer (2–6 marks), application questions (4–8 marks), and extended response (8–16 marks)
- Use scenarios/stimulus material where appropriate
- Cover AO1 (knowledge), AO2 (application), and AO3 (evaluation)
- Ensure the TOTAL of all question marks equals ${paper.marks}. Do NOT exceed the total marks.
- Keep sections realistic to the AQA layout for this paper.
- State clearly: "Answer ALL questions in all sections."
- Do NOT include hints or guidance lines for candidates (no lightbulb tips or cues).`;
        if (paper.id === 'paper2') {
          styleHint += `
- For Paper 2, match the AQA 7182/2 structure and totals exactly:
  - Section A: Approaches (3 questions, marks = 6, 8, 16)
  - Section B: Biopsychology (3 questions, marks = 6, 8, 16)
  - Section C: Research Methods (3 questions, marks = 6, 10, 20) — total paper marks = 96
- Keep Section C tied to one shared scenario (e.g., sleep deprivation and cognitive performance) so operationalisation, design, and ethics all reference that same scenario.
- Do NOT invent extra sections or change the mark pattern; adhere to the above layout.`;
        } else if (paper.id === 'paper1') {
          styleHint += `
- For Paper 1, include 1–2 short MCQs per section (e.g., one 2-mark MCQ and one 4-mark short answer), then longer items. Keep total marks = 96. A suggested pattern:
  - Section A (Social Influence): 2, 4, 6, 12 (total 24)
  - Section B (Memory): 2, 4, 6, 12 (total 24)
  - Section C (Attachment): 2, 4, 6, 12 (total 24)
  - Section D (Psychopathology): 2, 4, 6, 12 (total 24)
- Use MCQs as the first 1–2 items in each section.`;
        }
      } else if (isOcr) {
        if (paper.id === 'paper1') {
          // OCR H573/01 – Philosophy of Religion style
          styleHint = `
- Mirror OCR H573/01 Philosophy of Religion format
- Create exactly FOUR long-form essay questions, numbered 1–4, each worth 40 marks (total 120 marks)
- Each 40-mark question should integrate AO1 (knowledge/understanding) and AO2 (analysis/evaluation) in one combined essay
- Use authentic OCR-style command stems such as "Analyse...", "To what extent...", "Critically assess...", "Discuss..."
- Ensure coverage across these areas: Ancient philosophical influences; Soul, mind and body; Arguments for the existence of God; Religious experience / religious language (you may combine closely-related areas in a single question)
- Make the paper instructions clear that this is a 2-hour exam with FOUR questions on the paper and the candidate must answer ANY THREE of the four 40-mark questions
- Return exactly one section named "Philosophy of Religion" containing exactly four questions with "number": "1", "2", "3", "4" and each "marks": 40
- Set "totalMarks" to 120 in the JSON.`;
        } else {
          styleHint = `
- Create long-form essay questions in the OCR H573 style (typically 40-mark essays combining AO1 and AO2)
- Use OCR-style command words such as "Analyse...", "Evaluate...", "To what extent..."
- Cover AO1 (knowledge/understanding) and AO2 (analysis/evaluation) in each question
- Ensure the total marks equal ${paper.marks}`;
        }
      } else if (isEng) {
        styleHint = `
- Include extract-based and/or comparative essay questions
- Cover AO1 (knowledge), AO2 (analysis of language/form/structure), AO3 (context), AO4 (connections/comparisons), AO5 (critical interpretations)
- Use Edexcel 9ET0-style wording and mark weighting
- Ensure the total marks equal ${paper.marks}`;
      }

      const prompt = `You are an expert ${config.examBoard} ${config.subject} examiner creating a synthetic past paper.

PAPER: ${paper.name}
DURATION: ${paper.duration}
TOTAL MARKS: ${paper.marks}
TOPICS TO COVER: ${paper.topics.join(', ')}

Create a realistic exam paper with questions that match the ${config.examBoard} ${config.code} specification style.

For ${config.examBoard} ${config.subject}:
${styleHint}

Return STRICT JSON:
{
  "title": "Paper title",
  "instructions": "Brief exam instructions (e.g., Answer all questions.)",
  "sections": [
    {
      "name": "Section name",
      "questions": [
        {
          "number": "1",
          "text": "Question text",
          "marks": 8
        }
      ]
    }
  ],
  "totalMarks": ${paper.marks}
}`;

      const res = await callAIWithPublicSources(prompt, paper.name, paper.topics[0]);
      let parsed;
      try {
        parsed = JSON.parse(res);
      } catch {
        const match = res.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }
      // Ensure instructions present and strip any unused guidance/hints
      const cleanedSections = (parsed?.sections || []).map(sec => ({
        ...sec,
        questions: (sec.questions || []).map(q => ({
          ...q,
          guidance: undefined
        }))
      }));
      setGeneratedPaper({
        ...parsed,
        instructions: parsed?.instructions || 'Answer all questions in all sections.',
        sections: cleanedSections
      });
    } catch (e) {
      console.error('Failed to generate paper:', e);
      setGeneratedPaper({ error: 'Failed to generate paper. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const markFreeQuestion = async () => {
    setFqError('');
    setFqResult(null);
    if (!fqQuestion.trim() || !fqAnswer.trim()) {
      setFqError('Please enter both a question and your answer.');
      return;
    }
    setFqLoading(true);
    try {
      const examBoard = curriculum === 'aqa-psych'
        ? 'AQA Psychology'
        : curriculum === 'ocr-rs'
          ? 'OCR Religious Studies'
          : 'Edexcel English Literature';

      const isOCR = curriculum === 'ocr-rs';
      const ao1Max = isOCR ? Math.min(16, fqMarks) : null;
      const ao2Max = isOCR ? Math.min(24, fqMarks - (ao1Max || 0)) : null;

      const prompt = `You are an expert ${examBoard} examiner. Mark the student's answer to a single question using typical A-Level mark scheme criteria for this board. Give concise but specific feedback, with concrete examples/quotes (from the specification or typical sources) of what stronger AO1/AO2 would look like. Use best-fit and reward breadth + depth generously: if the student clearly covers key thinkers (e.g., Aquinas/Paley vs. Barth/Calvin, Hume/Darwin critiques, authority of revelation, circularity), structured compare/contrast, and some evaluation, place them in the top band unless there are major omissions or factual errors. Implicit references that show understanding count for credit even without verbatim quotes.

Candidate context (realism):
- 17–18 year-old writing under ~40-minute exam pressure for a 40-mark essay.
- Concise, signposted paragraphs are expected; not a dissertation.
- Minor spelling/grammar/typos should NOT be penalized unless meaning is unclear.
- Positive marking: reward what is present; best-fit level judgement; do not item-count.
- Top band can be earned with ~3–4 named scholars/terms plus 2–3 targeted critiques, if accurate, comparative, and evaluative.

Annotated return:
- In addition to scores/feedback, return an annotated version of the student's essay where you insert SQUARE-BRACKETED, ALL-CAPS comments inline (keep the student text intact). Insert immediately after the relevant phrase/sentence. Use:
  - [ADD: ...] for missing AO1 examples/quotes/critics.
  - [EVAL: ...] for sharper AO2 critique/counterpoint/application.
  - [CLARIFY: ...] where meaning is unclear.
  - [FIX: ...] if factually wrong.
- Keep comments concise; do NOT rewrite their sentences.
- annotatedEssay is REQUIRED. If you have no comments, return the original essay unchanged.

QUESTION [${fqMarks} marks]:
${fqQuestion}

STUDENT ANSWER:
${fqAnswer}

Instructions:
- Use the board's level descriptors/banding to decide the mark.
- Do not invent content; credit only what is present.
- Be fair but rigorous; partial credit for partial answers.
- In AO1 comment: mention at least one concrete piece of content (e.g., key term, theorist, study, date) that the student included, and one high-value item that would lift to top band.
- In AO2/AO3 comment: give a clear example of how the analysis/evaluation could be deepened (e.g., a specific criticism, counterpoint, or applied example).
- In whyNotNextLevel: name the missing elements that block the next band (e.g., missing study/quote/example, thin evaluation, limited balance).
- If the board is OCR RS and this is a 40-mark essay, award AO1 out of 16 and AO2 out of 24. Spell out what was right and what was missing for each AO.
- For strengths/improvements, be concrete: cite at least 1–2 specific examples/quotes/critics or studies that were present or missing (e.g., “Barth’s rejection of natural theology”, “Calvin sensus divinitatis”, “teleological argument as insufficient”, “Aquinas’ Five Ways”, “Augustine’s privation”). Avoid vague phrases like “add more detail”; say exactly what content or critique would raise the band.
- If the answer shows good structure, multiple key figures, and comparative evaluation, err toward higher marks (e.g., 34–38/40 for OCR 40-mark essays) unless there are clear factual gaps or minimal evaluation.
- Return STRICT JSON:
{
  "awarded": <number 0-${fqMarks}>,
  ${isOCR ? `"ao1Awarded": <number 0-${ao1Max}>, "ao2Awarded": <number 0-${ao2Max}>,` : ''}
  "feedback": "Overall comment",
  "strengths": ["..."],
  "improvements": ["..."],
  "levelDescriptor": "Level/mark band text",
  "ao1Comment": "Short AO1 note",
  "ao2Comment": "Short AO2/AO3 note",
  ${isOCR ? `"ao1Strengths": ["what AO1 did well"], "ao1Improvements": ["what AO1 missed"], "ao2Strengths": ["what AO2 did well"], "ao2Improvements": ["what AO2 missed"],` : ''}
  "whyNotNextLevel": "Why not in the next higher band",
  "annotatedEssay": "<student essay with inline [ADD]/[EVAL]/[CLARIFY]/[FIX] comments>"
}`;

      const res = await callAIWithPublicSources(prompt, 'Synthetic Free Question', fqQuestion.slice(0, 80));
      let parsed;
      try { parsed = JSON.parse(res); } catch { const m = String(res || '').match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : {}; }
      setFqResult({
        awarded: Math.min(Number(parsed.awarded || 0), fqMarks),
        ao1Awarded: isOCR ? Math.min(Number(parsed.ao1Awarded || 0), ao1Max || 0) : undefined,
        ao2Awarded: isOCR ? Math.min(Number(parsed.ao2Awarded || 0), ao2Max || 0) : undefined,
        feedback: parsed.feedback || '',
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        levelDescriptor: parsed.levelDescriptor || '',
        ao1Comment: parsed.ao1Comment || '',
        ao2Comment: parsed.ao2Comment || '',
        ao1Strengths: parsed.ao1Strengths || [],
        ao1Improvements: parsed.ao1Improvements || [],
        ao2Strengths: parsed.ao2Strengths || [],
        ao2Improvements: parsed.ao2Improvements || [],
        whyNotNextLevel: parsed.whyNotNextLevel || '',
        annotatedEssay: parsed.annotatedEssay || fqAnswer
      });
    } catch (e) {
      setFqError(e?.message || 'Failed to mark this answer.');
    } finally {
      setFqLoading(false);
    }
  };

  // If we have a fully generated paper and the user has chosen to start the exam,
  // hand off to the SyntheticExam component which mirrors the InteractiveExam UX.
  if (selectedPaper && generatedPaper && !loading && startExam) {
    const flatQuestions = [];
    (generatedPaper.sections || []).forEach((section) => {
      (section.questions || []).forEach((q, idx) => {
        flatQuestions.push({
          number: q.number || String(flatQuestions.length + 1),
          text: q.text,
          marks: q.marks,
          section: section.name || '',
        });
      });
    });

    return (
      <SyntheticExam
        curriculum={curriculum}
        paperMeta={{
          title: generatedPaper.title || selectedPaper.name,
          session: 'Synthetic',
          year: 'N/A',
          code: selectedPaper.paperCode || config.code,
          durationMinutes: selectedPaper.durationMinutes,
          totalMarks: generatedPaper.totalMarks || selectedPaper.marks,
          questionsToAnswer: selectedPaper.questionsToAnswer || null,
        }}
        questions={flatQuestions}
        onBack={() => {
          setStartExam(false);
          setSelectedPaper(null);
          setGeneratedPaper(null);
        }}
      />
    );
  }

  if (selectedPaper && (loading || generatedPaper)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => { setSelectedPaper(null); setGeneratedPaper(null); }} className="text-purple-600 underline mb-6">← Back to Paper Selection</button>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Generating {selectedPaper.name}...</h2>
              <p className="text-gray-600 mt-2">Creating exam-style questions based on the specification</p>
            </div>
          ) : generatedPaper?.error ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-red-600">{generatedPaper.error}</p>
              <button onClick={() => generatePaper(selectedPaper)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                Try Again
              </button>
            </div>
          ) : generatedPaper ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{generatedPaper.title}</h2>
                <p className="text-gray-600 mt-1">{config.examBoard} {config.subject} • {selectedPaper.duration} • {generatedPaper.totalMarks} marks</p>
              </div>
              
              {generatedPaper.instructions && (
                <div className="bg-gray-50 rounded p-4 text-sm text-gray-700">
                  <strong>Instructions:</strong> {generatedPaper.instructions}
                </div>
              )}

              {(generatedPaper.sections || []).map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">{section.name}</h3>
                  {(section.questions || []).map((q, qIdx) => {
                    const label = q.marks <= 2 ? `Question ${q.number} (MCQ)` : `Question ${q.number}`;
                    return (
                      <div key={qIdx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800">{label}</span>
                          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{q.marks} marks</span>
                        </div>
                        <p className="text-gray-700 mb-2">{q.text}</p>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="flex justify-center gap-4 pt-4 border-t">
                <button
                  onClick={() => setStartExam(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
                >
                  ▶ Start Timed Exam
                </button>
                <button onClick={() => generatePaper(selectedPaper)} className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded hover:bg-purple-50">
                  🔄 Generate New Paper
                </button>
                <button
                  onClick={() => {
                    setSelectedPaper(null);
                    setGeneratedPaper(null);
                    setStartExam(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Choose Different Paper
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-purple-600 underline mb-6">← Back to Home</button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-700" />
            <h1 className="text-3xl font-bold text-purple-800">Synthetic Past Papers</h1>
          </div>
          <p className="text-purple-600">{config.examBoard} {config.subject} ({config.code})</p>
          <p className="text-sm text-gray-600 mt-2">AI-generated exam papers matching the specification style</p>
        </div>

        {/* Free Question single-marking box */}
        <div className="mb-8 bg-white border border-purple-200 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Free Question (single marking)</h3>
            <span className="text-xs text-gray-500">{config.examBoard} {config.subject}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              value={fqQuestion}
              onChange={(e) => setFqQuestion(e.target.value)}
              placeholder="Paste or type your exam question here"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Max marks:</label>
              <input
                type="number"
                min="2"
                max="40"
                value={fqMarks}
                onChange={(e) => setFqMarks(parseInt(e.target.value, 10) || 0)}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </div>
            <textarea
              value={fqAnswer}
              onChange={(e) => setFqAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border rounded px-3 py-2 text-sm h-28"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={markFreeQuestion}
                disabled={fqLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
              >
                {fqLoading ? 'Marking…' : 'Mark my answer'}
              </button>
              {fqError && <span className="text-sm text-red-600">{fqError}</span>}
            </div>
            {fqResult && (
              <div className="border rounded p-3 bg-gray-50 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Score: {fqResult.awarded} / {fqMarks}</span>
                  {fqResult.levelDescriptor && <span className="text-gray-600">{fqResult.levelDescriptor}</span>}
                </div>
                {(fqResult.ao1Awarded !== undefined || fqResult.ao2Awarded !== undefined) && (
                  <div className="flex gap-3 text-gray-700">
                    {fqResult.ao1Awarded !== undefined && <span>AO1: {fqResult.ao1Awarded}{Number.isFinite(fqMarks) && curriculum === 'ocr-rs' ? ` / 16` : ''}</span>}
                    {fqResult.ao2Awarded !== undefined && <span>AO2: {fqResult.ao2Awarded}{Number.isFinite(fqMarks) && curriculum === 'ocr-rs' ? ` / 24` : ''}</span>}
                  </div>
                )}
                {fqResult.feedback && <div><strong>Feedback:</strong> {fqResult.feedback}</div>}
                {fqResult.ao1Comment && <div><strong>AO1:</strong> {fqResult.ao1Comment}</div>}
                {fqResult.ao2Comment && <div><strong>AO2/AO3:</strong> {fqResult.ao2Comment}</div>}
                {fqResult.whyNotNextLevel && <div><strong>Why not next level:</strong> {fqResult.whyNotNextLevel}</div>}
                {Array.isArray(fqResult.ao1Strengths) && fqResult.ao1Strengths.length > 0 && (
                  <div>
                    <strong>AO1 – What you got right:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao1Strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.ao1Improvements) && fqResult.ao1Improvements.length > 0 && (
                  <div>
                    <strong>AO1 – What you missed / to reach next level:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao1Improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.ao2Strengths) && fqResult.ao2Strengths.length > 0 && (
                  <div>
                    <strong>AO2 – What you got right:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao2Strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.ao2Improvements) && fqResult.ao2Improvements.length > 0 && (
                  <div>
                    <strong>AO2 – What you missed / to reach next level:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao2Improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.strengths) && fqResult.strengths.length > 0 && (
                  <div>
                    <strong>Strengths:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.improvements) && fqResult.improvements.length > 0 && (
                  <div>
                    <strong>Improvements:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {fqResult.annotatedEssay && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <strong>Annotated essay (inline coach notes):</strong>
                    <div className="whitespace-pre-wrap text-sm text-gray-800 mt-2">{fqResult.annotatedEssay}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Paper selection */}
        <div className="space-y-4">
          {config.papers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{paper.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {paper.duration}</span>
                    <span>{paper.marks} marks</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {paper.topics.map((t, i) => (
                      <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => generatePaper(paper)}
                  className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Generate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">✨ About Synthetic Papers</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Generated by AI to match the {config.examBoard} specification style</li>
            <li>• Includes realistic question types and mark allocations</li>
            <li>• Perfect for extra practice beyond past papers</li>
            <li>• Each generation creates a unique paper</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SyntheticPastPapers;


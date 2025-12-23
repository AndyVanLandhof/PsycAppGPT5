import React, { useState, useEffect } from 'react';
import { Clock, Loader2, ChevronLeft, ChevronRight, Send, FileText } from 'lucide-react';
import { useAIService } from '../hooks/useAIService';

function SyntheticExam({ curriculum, paperMeta, questions, onBack }) {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [examState, setExamState] = useState('ready'); // ready, inProgress, marking, completed
  const [timeRemaining, setTimeRemaining] = useState((paperMeta.durationMinutes || 120) * 60);
  const [results, setResults] = useState(null);
  const [markingProgress, setMarkingProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const { callAIWithPublicSources } = useAIService();

  // Initialise empty answers
  useEffect(() => {
    const initialAnswers = {};
    questions.forEach((_, i) => {
      initialAnswers[i] = '';
    });
    setAnswers(initialAnswers);
  }, [questions]);

  // Timer
  useEffect(() => {
    if (examState !== 'inProgress') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const startExam = () => {
    setExamState('inProgress');
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ]: value }));
  };

  const handleSubmit = async () => {
    setExamState('marking');

    const questionResults = [];
    const examBoard = curriculum === 'aqa-psych'
      ? 'AQA Psychology'
      : curriculum === 'ocr-rs'
        ? 'OCR Religious Studies'
        : 'Edexcel English Literature';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answers[i] || '';
      setMarkingProgress(Math.round(((i + 1) / questions.length) * 100));

      if (!answer.trim()) {
        questionResults.push({
          question: q.number,
          maxMarks: q.marks,
          awarded: 0,
          feedback: 'No answer provided.',
          strengths: [],
          improvements: ['Attempt all questions, even if unsure.']
        });
        continue;
      }

      try {
        // Exam board specific marking guidance (same as InteractiveExam)
        const markingGuidance = curriculum === 'aqa-psych'
          ? `AQA Psychology marking approach:
- Use level descriptors (Level 1/2/3) for extended responses
- Award marks for each valid point in shorter questions
- Credit accurate terminology and named studies with dates
- AO1 = knowledge, AO2 = application, AO3 = evaluation`
          : curriculum === 'ocr-rs'
            ? `OCR Religious Studies marking approach:
- Use level descriptors for extended responses (typically 10 or 15 mark questions)
- Credit accurate use of specialist terminology
- Look for clear argument structure and logical progression
- Credit valid alternative interpretations where appropriate`
            : `Edexcel English Literature marking approach:
- Use level descriptors for extended responses
- Credit close textual analysis and use of quotations
- Look for awareness of context, form, and critical perspectives
- Credit personal response and engagement with the text`;

        const prompt = `You are an expert ${examBoard} examiner marking a student's exam answer to a synthetic past paper question. You must mark EXACTLY as a real examiner would, using the official mark scheme criteria and typical level descriptors for this board and paper.

QUESTION ${q.number} [${q.marks} marks]:
${q.text}

STUDENT'S ANSWER:
${answer}

Note: This is a synthetic question but it follows the same style, AO balance, and difficulty as a real ${examBoard} question. Mark it as you would a real exam response.

${markingGuidance}

MARKING INSTRUCTIONS:
1. Use the LEVEL DESCRIPTORS appropriate for this paper to determine the level (if applicable).
2. Credit all valid, relevant points, including paraphrased or partially expressed ideas.
3. Apply typical board rules (e.g. "Just naming X is not creditworthy" where appropriate).
4. DO NOT infer student intent or award marks for material that is not explicitly present in the answer.
5. If the answer sits between two levels, use a best fit judgement across the descriptors; only move into a higher band when there is clear, sustained evidence, but do not look for excuses to mark down.
6. Be fair but rigorous – partial credit for partial answers.
7. For ${q.marks > 4 ? 'extended responses, use a "best fit" approach across levels' : 'short answers, award marks for each valid point made'}.
8. In your comments, make a short separate judgement on AO1 (knowledge/understanding) and AO2 (application/analysis/evaluation), and explain briefly why this answer is NOT in the next higher level.

Return STRICT JSON:
{
  "awarded": <number 0 to ${q.marks}>,
  "feedback": "Brief overall comment explaining the mark",
  "strengths": ["Specific things done well, referencing typical mark scheme criteria"],
  "improvements": ["Specific gaps, referencing what was needed from the question"],
  "levelDescriptor": "e.g. Level 2 (22–27 marks) – some accurate knowledge and mostly relevant analysis",
  "ao1Comment": "Short comment on AO1 performance (knowledge/understanding only)",
  "ao2Comment": "Short comment on AO2 performance (analysis/evaluation/application)",
  "whyNotNextLevel": "One or two sentences explaining why this is not in the next higher level"
}`;

        const res = await callAIWithPublicSources(
          prompt,
          paperMeta.title,
          q.section || 'Synthetic Exam'
        );
        let parsed;
        try {
          parsed = JSON.parse(res);
        } catch {
          const match = res.match(/\{[\s\S]*\}/);
          parsed = match ? JSON.parse(match[0]) : { awarded: 0, feedback: 'Could not parse marking result.' };
        }

        questionResults.push({
          question: q.number,
          questionText: q.text,
          studentAnswer: answer,
          maxMarks: q.marks,
          awarded: Math.min(parsed.awarded || 0, q.marks),
          feedback: parsed.feedback || '',
          strengths: parsed.strengths || [],
          improvements: parsed.improvements || [],
          levelDescriptor: parsed.levelDescriptor || '',
          ao1Comment: parsed.ao1Comment || '',
          ao2Comment: parsed.ao2Comment || '',
          whyNotNextLevel: parsed.whyNotNextLevel || ''
        });
      } catch (e) {
        questionResults.push({
          question: q.number,
          maxMarks: q.marks,
          awarded: 0,
          feedback: 'Error marking this question.',
          strengths: [],
          improvements: []
        });
      }
    }

    // If this paper is "answer N of M" (e.g. OCR H573/01 answer 3 of 4),
    // compute the total using the best N questions, mirroring real marking.
    let totalAwarded;
    let totalMax;
    if (paperMeta.questionsToAnswer && questions.length >= paperMeta.questionsToAnswer) {
      const sorted = [...questionResults].sort((a, b) => (b.awarded || 0) - (a.awarded || 0));
      const used = sorted.slice(0, paperMeta.questionsToAnswer);
      totalAwarded = used.reduce((sum, r) => sum + (r.awarded || 0), 0);
      totalMax = used.reduce((sum, r) => sum + (r.maxMarks || 0), 0);
    } else {
      totalAwarded = questionResults.reduce((sum, r) => sum + (r.awarded || 0), 0);
      totalMax = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    }
    const percentage = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 100) : 0;

    setResults({
      questions: questionResults,
      totalAwarded,
      totalMax,
      percentage,
      grade:
        percentage >= 80
          ? 'A*'
          : percentage >= 70
            ? 'A'
            : percentage >= 60
              ? 'B'
              : percentage >= 50
                ? 'C'
                : percentage >= 40
                  ? 'D'
                  : 'E'
    });

    setExamState('completed');
  };

  if (examState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={onBack} className="text-blue-600 underline mb-6">← Back to Papers</button>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{paperMeta.title}</h1>
            <p className="text-gray-600 mb-6">
              Synthetic • {paperMeta.code} • {paperMeta.durationMinutes} min
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-700">{questions.length}</div>
                <div className="text-sm text-slate-500">Questions</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-700">{paperMeta.totalMarks}</div>
                <div className="text-sm text-slate-500">Total Marks (target)</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-700">{paperMeta.durationMinutes} min</div>
                <div className="text-sm text-slate-500">Duration</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-amber-800 mb-2">⚠️ Exam Conditions</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• The timer will start when you click "Start Exam"</li>
                <li>
                  • {paperMeta.questionsToAnswer && questions.length > paperMeta.questionsToAnswer
                    ? `Answer any ${paperMeta.questionsToAnswer} of the ${questions.length} questions`
                    : 'Answer all questions in the spaces provided'}
                </li>
                <li>• Your answers will be marked by the same AI examiner used for real past papers</li>
                <li>• Treat this exactly like a real timed exam</li>
              </ul>
            </div>

            <button
              onClick={startExam}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'inProgress') {
    const q = questions[currentQ];
    const answeredCount = Object.values(answers).filter(a => a.trim()).length;

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-800">{paperMeta.code}</span>
              <span className="text-sm text-gray-500">Q{currentQ + 1} of {questions.length}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowInstructions(prev => !prev)}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                {showInstructions ? 'Hide instructions' : 'View instructions'}
              </button>
              <div className="text-sm text-gray-500">
                {answeredCount}/{questions.length} answered
              </div>
            </div>
          </div>
        </div>

        {/* Question area */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {showInstructions && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-amber-800">
              <h3 className="font-semibold mb-2">Exam Instructions</h3>
              <ul className="space-y-1">
                <li>• Time limit: {paperMeta.durationMinutes} minutes</li>
                <li>
                  • {paperMeta.questionsToAnswer && questions.length > paperMeta.questionsToAnswer
                    ? `Answer any ${paperMeta.questionsToAnswer} of the ${questions.length} questions`
                    : 'Answer all questions in the spaces provided'}
                </li>
                <li>• You can move freely between questions using the navigation buttons below.</li>
                <li>• Your answers are saved as you type and will not be lost when you switch questions.</li>
              </ul>
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-lg font-bold text-gray-800">Question {q.number}</span>
                {q.section && <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{q.section}</span>}
              </div>
              <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">{q.marks} marks</span>
            </div>

            <p className="text-gray-700 text-lg mb-6 leading-relaxed">{q.text}</p>

            <textarea
              value={answers[currentQ] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={Math.max(6, Math.ceil(q.marks / 2))}
              className="w-full border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Type your answer here..."
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>

            <div className="flex gap-1 overflow-x-auto max-w-md">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    i === currentQ
                      ? 'bg-blue-600 text-white'
                      : answers[i]?.trim()
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                <Send className="w-5 h-5" /> Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'marking') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Marking Your Exam</h2>
          <p className="text-gray-600 mb-4">Using the same digital examiner as real past papers...</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${markingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{markingProgress}% complete</p>
        </div>
      </div>
    );
  }

  if (examState === 'completed' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={onBack} className="text-blue-600 underline mb-6">← Back to Papers</button>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Synthetic Exam Results</h1>
            <div className="text-6xl font-bold text-purple-600 mb-2">{results.percentage}%</div>
            <div className="text-2xl font-semibold text-gray-700 mb-4">Grade: {results.grade}</div>
            <div className="text-gray-600">
              {results.totalAwarded} / {results.totalMax} raw marks
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Marked by the same AI examiner and grade thresholds as your real past papers,
              so this grade is directly comparable.
            </p>
          </div>

          {/* Question breakdown */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Question Breakdown</h2>
            {results.questions.map((r, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold">Question {r.question}</span>
                    {r.questionText && (
                      <p className="text-sm text-gray-600 mt-1 max-w-xl">
                        {r.questionText.substring(0, 150)}
                        {r.questionText.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r.awarded === r.maxMarks
                        ? 'bg-green-100 text-green-700'
                        : r.awarded > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {r.awarded}/{r.maxMarks}
                  </span>
                </div>

                <p className="text-gray-700 mb-2">{r.feedback}</p>

                {r.ao1Comment && (
                  <p className="text-sm text-blue-700 mb-1">
                    <strong>AO1:</strong> {r.ao1Comment}
                  </p>
                )}
                {r.ao2Comment && (
                  <p className="text-sm text-blue-700 mb-1">
                    <strong>AO2:</strong> {r.ao2Comment}
                  </p>
                )}
                {r.whyNotNextLevel && (
                  <p className="text-sm text-purple-700 mb-2">
                    <strong>Why not next level:</strong> {r.whyNotNextLevel}
                  </p>
                )}

                {r.strengths.length > 0 && (
                  <div className="mb-1">
                    <span className="text-sm font-medium text-green-700">✓ Strengths:</span>
                    <ul className="text-sm text-green-600 ml-4">
                      {r.strengths.map((s, j) => (
                        <li key={j}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.improvements.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-amber-700">→ To improve:</span>
                    <ul className="text-sm text-amber-600 ml-4">
                      {r.improvements.map((s, j) => (
                        <li key={j}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default SyntheticExam;



import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight, Send, FileText, ChevronDown, ChevronUp, Eye, BookOpen } from 'lucide-react';
import { getSelectedCurriculum } from '../config/curricula';
import { getPaperById } from '../config/pastPaperIndex';
import { useAIService } from '../hooks/useAIService';

/**
 * Expandable question result component
 */
function QuestionResult({ result: r, index }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold">Question {r.question}</span>
          {r.questionText && (
            <p className="text-sm text-gray-600 mt-1 max-w-xl">{r.questionText.substring(0, 150)}{r.questionText.length > 150 ? '...' : ''}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          r.awarded === r.maxMarks ? 'bg-green-100 text-green-700' :
          r.awarded > 0 ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {r.awarded}/{r.maxMarks}
        </span>
      </div>
      
      {r.levelDescriptor && (
        <p className="text-sm text-purple-600 mb-2 font-medium">{r.levelDescriptor}</p>
      )}
      
      <p className="text-gray-700 mb-3">{r.feedback}</p>
      
      {r.strengths.length > 0 && (
        <div className="mb-2">
          <span className="text-sm font-medium text-green-700">✓ Strengths:</span>
          <ul className="text-sm text-green-600 ml-4">
            {r.strengths.map((s, j) => <li key={j}>• {s}</li>)}
          </ul>
        </div>
      )}
      
      {r.improvements.length > 0 && (
        <div className="mb-3">
          <span className="text-sm font-medium text-amber-700">→ To improve:</span>
          <ul className="text-sm text-amber-600 ml-4">
            {r.improvements.map((s, j) => <li key={j}>• {s}</li>)}
          </ul>
        </div>
      )}
      
      {/* Expandable sections */}
      <div className="border-t pt-3 mt-3 space-y-2">
        {/* Your Answer */}
        {r.studentAnswer && (
          <div>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Eye className="w-4 h-4" />
              {showAnswer ? 'Hide' : 'View'} Your Answer
              {showAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAnswer && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
                {r.studentAnswer || <em className="text-gray-400">No answer provided</em>}
              </div>
            )}
          </div>
        )}
        
        {/* Mark Scheme */}
        {r.markSchemeSection && (
          <div>
            <button
              onClick={() => setShowMarkScheme(!showMarkScheme)}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
            >
              <BookOpen className="w-4 h-4" />
              {showMarkScheme ? 'Hide' : 'View'} Official Mark Scheme
              {showMarkScheme ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showMarkScheme && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {r.markSchemeSection}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Parse questions from extracted text file
 * Returns array of { number, text, marks, section }
 */
function parseQuestionsFromText(text) {
  const questions = [];
  const lines = text.split('\n');
  
  let currentSection = '';
  let currentQuestion = null;
  let questionBuffer = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip page markers and formatting
    if (line.startsWith('---') || line.match(/^\*\d+\*$/) || line.match(/^IB\//) || line === 'Do not write' || line === 'outside the' || line === 'box' || line === 'Extra space' || line === 'Turn over ►') {
      continue;
    }
    
    // Detect section headers
    if (line.match(/^Section [A-Z]$/i)) {
      continue;
    }
    if (['Social Influence', 'Memory', 'Attachment', 'Psychopathology', 'Approaches', 'Biopsychology', 'Research Methods'].includes(line)) {
      currentSection = line;
      continue;
    }
    
    // Detect question numbers (e.g., "0 1", "0 2", "0 7 . 1")
    const questionMatch = line.match(/^0\s*(\d+)(?:\s*\.\s*(\d+))?$/);
    if (questionMatch) {
      // Save previous question
      if (currentQuestion && questionBuffer.length > 0) {
        currentQuestion.text = questionBuffer.join(' ').trim();
        if (currentQuestion.text && currentQuestion.marks > 0) {
          questions.push({ ...currentQuestion });
        }
      }
      
      const mainNum = questionMatch[1];
      const subNum = questionMatch[2];
      currentQuestion = {
        number: subNum ? `${mainNum}.${subNum}` : mainNum,
        text: '',
        marks: 0,
        section: currentSection
      };
      questionBuffer = [];
      continue;
    }
    
    // Detect marks
    const marksMatch = line.match(/\[(\d+)\s*marks?\]/i);
    if (marksMatch && currentQuestion) {
      currentQuestion.marks = parseInt(marksMatch[1]);
      // Remove marks from the line and add to buffer
      const cleanLine = line.replace(/\[(\d+)\s*marks?\]/i, '').trim();
      if (cleanLine) questionBuffer.push(cleanLine);
      continue;
    }
    
    // Add line to question buffer
    if (currentQuestion && line && !line.match(/^\d+$/) && line.length > 2) {
      questionBuffer.push(line);
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && questionBuffer.length > 0) {
    currentQuestion.text = questionBuffer.join(' ').trim();
    if (currentQuestion.text && currentQuestion.marks > 0) {
      questions.push(currentQuestion);
    }
  }
  
  // Filter out invalid questions
  return questions.filter(q => q.text.length > 10 && q.marks > 0);
}

function InteractiveExam({ paperId, onBack }) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const paper = useMemo(() => getPaperById(curriculum, paperId), [curriculum, paperId]);
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examState, setExamState] = useState('loading'); // loading, ready, inProgress, marking, completed
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [markSchemeText, setMarkSchemeText] = useState('');
  const [results, setResults] = useState(null);
  const [markingProgress, setMarkingProgress] = useState(0);
  
  const { callAIWithPublicSources } = useAIService();
  
  // Load questions from vault
  useEffect(() => {
    if (!paper) {
      setError('Paper not found');
      setLoading(false);
      return;
    }
    
    const loadPaper = async () => {
      try {
        // Load question paper
        const qRes = await fetch(paper.questionFile);
        if (!qRes.ok) throw new Error('Failed to load question paper');
        const qText = await qRes.text();
        
        // Parse questions
        const parsed = parseQuestionsFromText(qText);
        if (parsed.length === 0) {
          throw new Error('No questions could be parsed from the paper');
        }
        setQuestions(parsed);
        
        // Initialize answers
        const initialAnswers = {};
        parsed.forEach((q, i) => { initialAnswers[i] = ''; });
        setAnswers(initialAnswers);
        
        // Load mark scheme
        const msRes = await fetch(paper.markSchemeFile);
        if (msRes.ok) {
          const msText = await msRes.text();
          setMarkSchemeText(msText);
        }
        
        setTimeRemaining(paper.duration * 60); // Convert to seconds
        setExamState('ready');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadPaper();
  }, [paper]);
  
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
    const examBoard = curriculum === 'aqa-psych' ? 'AQA Psychology' : curriculum === 'ocr-rs' ? 'OCR Religious Studies' : 'Edexcel English Literature';
    
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
        // Extract the relevant mark scheme section for this question
        const questionPattern = new RegExp(`0\\s*${q.number.replace('.', '\\s*\\.\\s*')}[\\s\\S]*?(?=0\\s*\\d|$)`, 'i');
        const markSchemeSection = markSchemeText.match(questionPattern)?.[0] || '';
        
        const prompt = `You are an expert ${examBoard} examiner marking a student's exam answer. You must mark EXACTLY as a real examiner would, using the official mark scheme criteria.

QUESTION ${q.number} [${q.marks} marks]:
${q.text}

STUDENT'S ANSWER:
${answer}

${markSchemeSection ? `===== OFFICIAL MARK SCHEME FOR THIS QUESTION =====
${markSchemeSection.substring(0, 4000)}
===== END MARK SCHEME =====` : ''}

MARKING INSTRUCTIONS:
1. Use the LEVEL DESCRIPTORS from the mark scheme to determine the level (if provided)
2. Check the POSSIBLE CONTENT list - credit valid points even if not listed ("Credit other relevant content")
3. Apply the specific marking rules (e.g., "Just naming X is not creditworthy")
4. Be fair but rigorous - partial credit for partial answers
5. For ${q.marks > 4 ? 'extended responses, use a "best fit" approach across levels' : 'short answers, award marks for each valid point made'}

Return STRICT JSON:
{
  "awarded": <number 0 to ${q.marks}>,
  "feedback": "Brief overall comment explaining the mark",
  "strengths": ["Specific things done well, referencing mark scheme criteria"],
  "improvements": ["Specific gaps, referencing what was needed from mark scheme"],
  "levelDescriptor": "e.g. Level 2 (3-4 marks) - Some knowledge evident but lacks clarity"
}`;
        
        const res = await callAIWithPublicSources(prompt, paper.paper, q.section || 'Exam');
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
          markSchemeSection: markSchemeSection.substring(0, 2000) || ''
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
    
    const totalAwarded = questionResults.reduce((sum, r) => sum + r.awarded, 0);
    const totalMax = questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 100) : 0;
    
    setResults({
      questions: questionResults,
      totalAwarded,
      totalMax,
      percentage,
      grade: percentage >= 80 ? 'A*' : percentage >= 70 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'E'
    });
    
    setExamState('completed');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading exam paper...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <button onClick={onBack} className="text-blue-600 underline mb-6">← Back</button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Paper</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (examState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={onBack} className="text-blue-600 underline mb-6">← Back to Papers</button>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{paper.paper}</h1>
            <p className="text-gray-600 mb-6">{paper.session} {paper.year} • {paper.code}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-700">{questions.length}</div>
                <div className="text-sm text-slate-500">Questions</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-700">{paper.totalMarks}</div>
                <div className="text-sm text-slate-500">Total Marks</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-700">{paper.duration} min</div>
                <div className="text-sm text-slate-500">Duration</div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-amber-800 mb-2">⚠️ Exam Conditions</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• The timer will start when you click "Start Exam"</li>
                <li>• Answer all questions in the spaces provided</li>
                <li>• Your answers will be marked by AI using the official mark scheme</li>
                <li>• You can navigate between questions at any time</li>
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
              <span className="font-semibold text-gray-800">{paper.code}</span>
              <span className="text-sm text-gray-500">Q{currentQ + 1} of {questions.length}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            <div className="text-sm text-gray-500">
              {answeredCount}/{questions.length} answered
            </div>
          </div>
        </div>
        
        {/* Question area */}
        <div className="max-w-4xl mx-auto px-4 py-6">
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
          <p className="text-gray-600 mb-4">Using official mark scheme criteria...</p>
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
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Exam Results</h1>
            <div className="text-6xl font-bold text-purple-600 mb-2">{results.percentage}%</div>
            <div className="text-2xl font-semibold text-gray-700 mb-4">Grade: {results.grade}</div>
            <div className="text-gray-600">
              {results.totalAwarded} / {results.totalMax} marks
            </div>
          </div>
          
          {/* Question breakdown */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Question Breakdown</h2>
            {results.questions.map((r, i) => (
              <QuestionResult key={i} result={r} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

export default InteractiveExam;


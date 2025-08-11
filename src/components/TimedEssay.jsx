import React, { useState, useEffect, useRef } from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, Trophy, BookOpen, Target, Play, PenTool, Star, Award, X, ArrowLeft } from 'lucide-react';
import { useAIService } from '../hooks/useAIService';

function TimedEssay({ topic, onComplete, onBack }) {
  const [phase, setPhase] = useState('welcome');
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const { callAI, isLoading } = useAIService();

  const startEssayProcess = () => {
    setPhase('loading');
    generateQuestion();
  };

  const handleExitEssay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onBack();
  };

  const generateQuestion = async () => {
    try {
      const prompt = `Generate an authentic AQA Psychology 7182 A-Level exam question for the topic "${topic.title}" in the ${topic.component} component.

Requirements:
- Use AQA Psychology 7182 past paper format
- Mark allocation: 16 marks (short, highly structured essay)
- Use command words such as: "Outline and evaluate...", "Discuss...", "Assess..."
- Question should require both AO1 (describe theory/study) and AO3 (evaluate, critique, compare)
- Provide a brief guidance section for students
- Time limit: 16 minutes

Format your response as JSON:
{
  "question": "The actual exam question text (e.g., 'Outline and evaluate the Multi-Store Model of Memory.')",
  "marks": 16,
  "timeLimit": 16,
  "guidance": [
    "Introduction: Define key terms and outline the theory",
    "AO1: Describe the theory or study in detail",
    "AO3: Strengths, limitations, comparisons, methodological critique",
    "Conclusion: Balanced judgment or brief summary",
    "Each paragraph = 1 AO1 + 1 AO3 (aim for 3-4 paragraphs)"
  ],
  "assessmentObjectives": [
    "AO1: Accurate description of theory/study, use of key terms",
    "AO3: Critical evaluation, strengths, limitations, comparisons, methodological critique"
  ],
  "commandWords": ["Outline and evaluate", "Discuss", "Assess"]
}`;

      const response = await callAI(prompt, 'You are an OCR A-Level Religious Studies examiner creating authentic past paper questions.');
      
      try {
        const questionData = JSON.parse(response);
        setQuestion(questionData);
        setTotalTime(questionData.timeLimit * 60);
        setTimeLeft(questionData.timeLimit * 60);
        setPhase('instructions');
      } catch (parseError) {
        const fallbackQuestion = {
          question: `"Religious experience provides convincing evidence for the existence of God." Evaluate this view with reference to the topic of ${topic.title}.`,
          marks: 40,
          timeLimit: 45,
          guidance: [
            "In your answer you should develop a sustained line of reasoning which is coherent, relevant, substantiated and logically structured.",
            "You must refer to different religious and non-religious perspectives in your answer."
          ],
          assessmentObjectives: [
            "AO1: Demonstrate knowledge and understanding of religion and belief, including religious, philosophical and ethical thought and teaching.",
            "AO2: Analyse and evaluate aspects of, and approaches to, religion and belief, including their significance, influence and study."
          ]
        };
        setQuestion(fallbackQuestion);
        setTotalTime(45 * 60);
        setTimeLeft(45 * 60);
        setPhase('instructions');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      setPhase('instructions');
    }
  };

  const startWriting = () => {
    setPhase('writing');
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitEssay(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitEssay = async (timeUp = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsSubmitting(true);
    setPhase('submitted');

    try {
      const timeSpent = Math.round((totalTime - timeLeft) / 60);
      
      const markingPrompt = `You are an experienced OCR H573 A-Level Religious Studies examiner. Mark this essay according to OCR assessment criteria.

IMPORTANT: Award marks in line with the official OCR grade boundaries below. Do not inflate marks, but do not be harsher than a real examiner. Use real OCR examiner standards and provide constructive, fair feedback.

QUESTION: ${question?.question}
MARKS AVAILABLE: 40 (AO1: 16, AO2: 24)
TIME SPENT: ${timeSpent} minutes
${timeUp ? 'NOTE: Student ran out of time' : ''}

STUDENT ESSAY:
${essay}

MARKING CRITERIA:
AO1 (Knowledge & Understanding) - 16 marks:
- Level 4 (13-16): Detailed knowledge, fully developed understanding, comprehensive range of scholarly views
- Level 3 (9-12): Good knowledge, developed understanding, range of scholarly views  
- Level 2 (5-8): Satisfactory knowledge, some understanding, limited scholarly views
- Level 1 (1-4): Basic knowledge, little understanding, few scholarly views

AO2 (Analysis & Evaluation) - 24 marks:
- Level 4 (19-24): Sustained evaluation, excellent analysis, sophisticated argument
- Level 3 (13-18): Good evaluation, clear analysis, well-developed argument
- Level 2 (7-12): Some evaluation, limited analysis, underdeveloped argument  
- Level 1 (1-6): Little evaluation, minimal analysis, weak argument

OFFICIAL OCR GRADE BOUNDARIES:
- A*: 32-40
- A: 28-31
- B: 24-27
- C: 20-23
- D: 16-19
- E: 12-15
- U: 0-11

Provide detailed feedback in JSON format:
{
  "score": [total out of 40],
  "maxScore": 40,
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "detailedComments": "Detailed paragraph of feedback",
    "aoBreakdown": {
      "ao1": {"score": [out of 16], "feedback": "AO1 specific feedback"},
      "ao2": {"score": [out of 24], "feedback": "AO2 specific feedback"}
    }
  }
}`;

      const markingResponse = await callAI(markingPrompt, 'You are a senior OCR A-Level Religious Studies examiner with 15+ years experience.');
      
      try {
        const resultData = JSON.parse(markingResponse);
        setResult(resultData);
        setPhase('results');
        onComplete(resultData.score, essay, JSON.stringify(resultData.feedback));
      } catch (parseError) {
        const fallbackResult = {
          score: Math.max(8, Math.min(32, Math.floor(essay.length / 40))),
          maxScore: 40,
          feedback: {
            strengths: ["Attempted to address the question", "Showed some understanding of the topic"],
            improvements: ["Develop arguments further", "Include more scholarly perspectives", "Improve evaluation skills"],
            detailedComments: "Your essay shows a basic understanding of the topic. To improve, focus on developing more detailed arguments and including a wider range of scholarly perspectives.",
            aoBreakdown: {
              ao1: { score: 10, feedback: "Basic knowledge demonstrated" },
              ao2: { score: 12, feedback: "Some analysis present but needs development" }
            }
          }
        };
        setResult(fallbackResult);
        setPhase('results');
        onComplete(fallbackResult.score, essay, JSON.stringify(fallbackResult.feedback));
      }
    } catch (error) {
      console.error('Error marking essay:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateWordCount = (text) => {
    setEssay(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const getTimeColor = () => {
    const percentLeft = (timeLeft / totalTime) * 100;
    if (percentLeft > 50) return "text-green-600";
    if (percentLeft > 25) return "text-yellow-600";
    return "text-red-600";
  };

  const storeEssay = () => {
    if (!result || !question) return;

    const essayData = {
      id: Date.now().toString(),
      topic: topic.component,
      subTopic: topic.title,
      question: question.question,
      content: essay,
      wordCount: wordCount,
      score: result.score,
      maxScore: result.maxScore,
      successRate: Math.round((result.score / result.maxScore) * 100),
      feedback: result.feedback,
      timestamp: new Date().toISOString(),
      timeSpent: Math.round((totalTime - timeLeft) / 60),
      marks: question.marks,
      timeLimit: question.timeLimit
    };

    // Get existing essays for this sub-topic
    const storageKey = `essay-stored-${topic.title.toLowerCase().replace(/\s+/g, '-')}`;
    const existingEssays = localStorage.getItem(storageKey);
    let essays = [];
    
    if (existingEssays) {
      essays = JSON.parse(existingEssays);
    }

    // Add new essay (limit to 50 stored essays)
    essays.unshift(essayData);
    if (essays.length > 50) {
      essays = essays.slice(0, 50);
    }

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(essays));

    // Show success message (you could add a toast notification here)
    alert('Essay stored successfully! You can view it in the storage dashboard.');
  };

  if (phase === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topic
            </button>
          </div>

          <div className="bg-white border-l-4 border-l-orange-500 rounded-lg shadow-lg">
            <div className="p-8">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <PenTool className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <Star className="w-6 h-6 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Psychology Timed Essay
                    </h1>
                    <p className="text-xl text-gray-600">
                      {topic.component}: {topic.title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800">45 Minutes</h3>
                    <p className="text-sm text-blue-600">Exam Conditions</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                    <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-800">40 Marks</h3>
                    <p className="text-sm text-purple-600">Full Essay Question</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800">AI Marking</h3>
                    <p className="text-sm text-green-600">OCR Examiner Style</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    What to Expect
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      An authentic OCR H573 past paper style question will be generated for your topic
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      You'll have time to read the question and instructions before starting
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      Click "Go" to start the 45-minute timer and begin writing
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      AI will mark your essay using official OCR assessment criteria
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      Receive detailed feedback on AO1 (Knowledge) and AO2 (Analysis & Evaluation)
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={startEssayProcess}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    <Play className="w-5 h-5 mr-2 inline" />
                    Start My Timed Essay
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Ready to practice your A-Level essay skills? Click start when you're prepared to begin!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topic
            </button>
          </div>

          <div className="bg-white border-l-4 border-l-orange-500 rounded-lg shadow-lg">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Generating Your Timed Essay Question...</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Creating a personalized OCR H573 essay question for {topic.component}: {topic.title}
              </p>
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  <div className="space-y-2">
                    <p className="font-medium">Creating your personalized essay question</p>
                    <p className="text-sm text-gray-500">
                      Using OCR H573 past paper format for {topic.component}: {topic.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'instructions' && question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topic
            </button>
          </div>

          <div className="space-y-6">
            {/* Question Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {question.marks} marks
                </span>
                <span className="border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {question.timeLimit} minutes
                </span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-3">Question:</h3>
              <p className="text-blue-800 leading-relaxed text-lg">{question.question}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Guidance
                </h3>
                <ul className="space-y-2">
                  {question.guidance.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Assessment Objectives
                </h3>
                <ul className="space-y-2">
                  {question.assessmentObjectives.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tips for Success
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-green-700">
                <div>• Plan your essay structure first (5 minutes)</div>
                <div>• Include scholarly perspectives</div>
                <div>• Balance knowledge (AO1) with evaluation (AO2)</div>
                <div>• Aim for ~600-700 words</div>
                <div>• Support arguments with evidence</div>
                <div>• Consider counter-arguments</div>
              </div>
            </div>

            <div className="text-center pt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-orange-800 mb-2">Ready to Begin?</h3>
                <p className="text-orange-700 mb-4">
                  Once you click "Go", the {question.timeLimit}-minute timer will start immediately and you'll be taken to the writing area.
                </p>
                <button onClick={startWriting} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">
                  <Play className="w-5 h-5 mr-2 inline" />
                  Go! Start Writing ({question.timeLimit} minutes)
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Make sure you understand the question and requirements before starting
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'writing' && question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {wordCount} words
              </span>
              <span className={`border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getTimeColor()}`}>
                <Clock className="w-3 h-3" />
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Exit Button */}
            <button 
              onClick={handleExitEssay}
              className="border border-red-200 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Exit Essay
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-800">{question.question}</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${(1 - timeLeft / totalTime) * 100}%` }}
              ></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <textarea
                value={essay}
                onChange={(e) => updateWordCount(e.target.value)}
                placeholder="Begin writing your essay here..."
                className="w-full min-h-[500px] resize-none focus:ring-2 focus:ring-blue-500 text-base border-none shadow-none outline-none"
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Target: ~{Math.round(question.marks * 25)} words for {question.marks} marks
              </div>
              <button 
                onClick={() => submitEssay(false)}
                disabled={essay.trim().length < 50}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  timeLeft < 300 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                }`}
              >
                {timeLeft < 300 ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2 inline" />
                    Submit Now (Time Running Out!)
                  </>
                ) : (
                  "Submit Essay for Marking"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white border-l-4 border-l-orange-500 rounded-lg shadow-lg">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Essay Submitted Successfully!</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Our AI examiner is now marking your essay using OCR H573 assessment criteria and examining standards.
              </p>
              <div className="text-center py-12 space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div>
                    <CheckCircle className="w-8 h-8 text-green-600 absolute top-4 left-4" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">AI Examiner is Marking Your Essay</p>
                    <p className="text-sm text-gray-500">
                      Using OCR H573 assessment criteria and examining standards...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Analyzing content structure</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Evaluating arguments and evidence</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span>Preparing detailed feedback</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    const getScoreColor = (score) => {
      if (score >= 20) return "text-green-600 bg-green-50 border-green-200";
      if (score >= 15) return "text-blue-600 bg-blue-50 border-blue-200";
      if (score >= 10) return "text-yellow-600 bg-yellow-50 border-yellow-200";
      return "text-red-600 bg-red-50 border-red-200";
    };

    const getGrade = (score) => {
      // OCR H573 grade boundaries (2023 actual data)
      const percentage = (score / 40) * 100;
      if (percentage >= 79) return "A*";
      if (percentage >= 69) return "A";
      if (percentage >= 60) return "B";
      if (percentage >= 51) return "C";
      if (percentage >= 41) return "D";
      return "U";
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topic
            </button>
          </div>

          <div className="space-y-6">
            {/* Score Display */}
            <div className="bg-white border-l-4 border-l-green-500 rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Your Essay Results</h2>
                </div>
                <div className="text-center py-6">
                  <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 ${getScoreColor(result.score)}`}>
                    <Award className="w-8 h-8" />
                    <div>
                      <div className="text-3xl font-bold">
                        {result.score}/{result.maxScore}
                      </div>
                      <div className="text-sm font-medium">
                        Grade: {getGrade(result.score)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <h4 className="font-semibold text-blue-800 mb-1">AO1: Knowledge & Understanding</h4>
                      <div className="text-2xl font-bold text-blue-700">
                        {result.feedback.aoBreakdown.ao1.score}/16
                      </div>
                      <p className="text-sm text-blue-600 mt-2">
                        {result.feedback.aoBreakdown.ao1.feedback}
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-center">
                      <h4 className="font-semibold text-purple-800 mb-1">AO2: Analysis & Evaluation</h4>
                      <div className="text-2xl font-bold text-purple-700">
                        {result.feedback.aoBreakdown.ao2.score}/24
                      </div>
                      <p className="text-sm text-purple-600 mt-2">
                        {result.feedback.aoBreakdown.ao2.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Detailed Examiner Feedback</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 leading-relaxed">
                      {result.feedback.detailedComments}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {result.feedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-green-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {result.feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-orange-700">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button onClick={() => setPhase('welcome')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <PenTool className="w-4 h-4 mr-2 inline" />
                Try Another Essay
              </button>
              <button 
                onClick={() => storeEssay()} 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Store this Timed Essay
              </button>
              <button onClick={onBack} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Continue Studying
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default TimedEssay;

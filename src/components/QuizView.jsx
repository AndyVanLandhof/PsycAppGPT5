import React, { useState, useEffect } from 'react';
import { useAIService } from "../hooks/useAIService";
import { useVaultService } from "../hooks/useVaultService";
import { useElevenLabsTTS } from "../hooks/useElevenLabsTTS";
import { Loader2, Volume2, CheckCircle, XCircle, RotateCcw, History, Play, Download, Save, FileText, Pause, StopCircle } from "lucide-react";
import jsPDF from 'jspdf';

function QuizView({ topic, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [storedQuizzes, setStoredQuizzes] = useState([]);
  const [showStoredQuizzes, setShowStoredQuizzes] = useState(false);
  const [activeAudioSection, setActiveAudioSection] = useState(null);
  const [mode, setMode] = useState(null); // 'blind' or 'show'
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Stats for current quiz
  const [quizStats, setQuizStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  const { callAIWithVault } = useAIService();
  const { createVaultPrompt, getRelevantContext, isVaultLoaded, vaultLoaded } = useVaultService();
  const { callAI } = useAIService();
  const { speak, playPreparedAudio, audioReady, audioLoading, audioError, pause, stop, ttsState } = useElevenLabsTTS();

  // Load quiz history and stored quizzes from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`quiz-history-${topic.subTopic.id}`);
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory));
    }
    
    const savedQuizzes = localStorage.getItem(`quiz-stored-${topic.subTopic.id}`);
    if (savedQuizzes) {
      setStoredQuizzes(JSON.parse(savedQuizzes));
    }
  }, [topic.subTopic.id]);

  // Reset active audio section when audio ends
  useEffect(() => {
    if (ttsState === 'idle') {
      setActiveAudioSection(null);
    }
  }, [ttsState]);

  // Only generate quiz after vault is loaded
  useEffect(() => {
    if (vaultLoaded) {
      generateQuiz();
    }
  }, [vaultLoaded]);

  const extractFirstJson = (text) => {
    // Regex to find the first {...} JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return match[0];
    }
    return null;
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    const basePrompt = `You are an expert A-Level Religious Studies teacher creating a quiz for OCR H573 students.\n\nTOPIC: ${topic.title}\nSUB-TOPIC: ${topic.subTopic.title}\n\nCreate EXACTLY 10 multiple choice questions that are SPECIFICALLY about \"${topic.subTopic.title}\". Each question should test understanding of key concepts, definitions, arguments, philosophers, or important details that are directly related to this sub-topic.\n\nDo NOT mention reference numbers (e.g., Reference 3) in the question or options. Only mention references in the explanation if needed.\n\nReturn in this JSON format:\n{\n  \"questions\": [\n    {\n      \"question\": \"A specific question about ${topic.subTopic.title} based on the OCR materials\",\n      \"options\": [\n        \"Option A\",\n        \"Option B\", \n        \"Option C\",\n        \"Option D\"\n      ],\n      \"correctAnswer\": 0,\n      \"explanation\": \"Detailed explanation referencing specific OCR content and why this is correct\"\n    }\n  ]\n}\n`;
    try {
      const vaultPrompt = createVaultPrompt(basePrompt, topic.title, topic.subTopic.title, true, { quiz: true });
      const result = await callAIWithVault(
        vaultPrompt,
        topic.title,
        topic.subTopic.title,
        { includeAdditional: true }
      );
      console.log('[Quiz][AI Raw Result]', result);
      let parsed;
      try {
        const jsonStr = extractFirstJson(result);
        if (!jsonStr) throw new Error('No JSON found in AI output');
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn('[Quiz][Parse Error] Could not parse AI output as JSON:', parseErr);
        console.warn('[Quiz][Fallback] Using fallback questions (AI parse error)');
        setQuestions(generateFallbackQuestions());
        setIsLoading(false);
        return;
      }
      const quizQuestions = parsed.questions || [];
      if (quizQuestions.length < 10) {
        console.warn('[Quiz][Fallback] Using fallback questions (AI returned <10 questions)');
        setQuestions(generateFallbackQuestions());
      } else {
        setQuestions(quizQuestions.slice(0, 10));
      }
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuizComplete(false);
      setShowResults(false);
      setQuizStats({ correct: 0, incorrect: 0, total: 0 });
    } catch (err) {
      console.warn('[Quiz][Fallback] Using fallback questions (AI error)', err);
      setQuestions(generateFallbackQuestions());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackQuestions = () => {
    // Create topic-specific fallback questions based on the actual topic
    const topicSpecificQuestions = {
      'Philosophy of Religion': {
        'Religious Experience': [
          {
            question: "What is William James' definition of religious experience?",
            options: [
              "A feeling of being at one with the universe",
              "A sense of the presence of the divine",
              "An experience that is ineffable, noetic, transient, and passive",
              "A mystical encounter with God"
            ],
            correctAnswer: 2,
            explanation: "James identified four characteristics of religious experience: ineffable (cannot be described), noetic (provides knowledge), transient (temporary), and passive (beyond control)."
          },
          {
            question: "Which philosopher argued that religious experiences are 'veridical'?",
            options: [
              "William James",
              "Richard Swinburne",
              "Rudolf Otto",
              "Sigmund Freud"
            ],
            correctAnswer: 1,
            explanation: "Swinburne argued that religious experiences are veridical (genuine encounters with the divine) and should be trusted unless there are good reasons to doubt them."
          }
        ],
        'The Problem of Evil': [
          {
            question: "What is the logical problem of evil?",
            options: [
              "The question of why evil exists",
              "The apparent contradiction between God's existence and evil's existence",
              "The problem of defining what evil is",
              "The question of how to respond to evil"
            ],
            correctAnswer: 1,
            explanation: "The logical problem of evil argues that the existence of an all-powerful, all-knowing, all-good God is logically incompatible with the existence of evil."
          },
          {
            question: "Which philosopher developed the Free Will Defence?",
            options: [
              "Alvin Plantinga",
              "John Hick",
              "Augustine",
              "Irenaeus"
            ],
            correctAnswer: 0,
            explanation: "Alvin Plantinga developed the Free Will Defence, arguing that evil exists because God gave humans free will, which is necessary for genuine moral choice."
          }
        ]
      },
      'Religion and Ethics': {
        'Natural Law': [
          {
            question: "What is the primary precept of Natural Law according to Aquinas?",
            options: [
              "Do good and avoid evil",
              "Follow God's commands",
              "Maximize happiness",
              "Respect human dignity"
            ],
            correctAnswer: 0,
            explanation: "Aquinas identified 'do good and avoid evil' as the primary precept of Natural Law, from which all other moral principles derive."
          },
          {
            question: "What are the four tiers of law in Aquinas' system?",
            options: [
              "Eternal, Natural, Human, Divine",
              "Moral, Legal, Religious, Social",
              "Universal, Particular, Temporal, Spiritual",
              "Primary, Secondary, Tertiary, Quaternary"
            ],
            correctAnswer: 0,
            explanation: "Aquinas identified four tiers: Eternal Law (God's plan), Natural Law (human reason), Human Law (civil laws), and Divine Law (revelation)."
          }
        ],
        'Situation Ethics': [
          {
            question: "What is the central principle of Situation Ethics?",
            options: [
              "Do unto others as you would have them do unto you",
              "The greatest good for the greatest number",
              "Love is the only absolute",
              "Follow your conscience"
            ],
            correctAnswer: 2,
            explanation: "Joseph Fletcher argued that 'love is the only absolute' and all other moral rules are relative to this principle."
          }
        ]
      },
      'Developments in Christian Thought': {
        'Knowledge of God': [
          {
            question: "What is the via negativa approach to knowing God?",
            options: [
              "Knowing God through what God is not",
              "Knowing God through revelation",
              "Knowing God through reason",
              "Knowing God through experience"
            ],
            correctAnswer: 0,
            explanation: "The via negativa (negative way) involves understanding God by saying what God is not, rather than what God is."
          },
          {
            question: "Which theologian emphasized the importance of revelation in knowing God?",
            options: [
              "Karl Barth",
              "Thomas Aquinas",
              "Moses Maimonides",
              "John Calvin"
            ],
            correctAnswer: 0,
            explanation: "Karl Barth emphasized that knowledge of God comes through divine revelation, not through human reason or experience."
          }
        ]
      }
    };

    // Get topic-specific questions or use generic ones
    const topicQuestions = topicSpecificQuestions[topic.title]?.[topic.subTopic.title] || [
      {
        question: `What is a key concept in ${topic.subTopic.title}?`,
        options: [
          "Understanding religious texts",
          "Exploring philosophical concepts",
          "Analyzing ethical dilemmas", 
          "Studying historical events"
        ],
        correctAnswer: 1,
        explanation: `This sub-topic primarily focuses on exploring key concepts within ${topic.title}.`
      },
      {
        question: `How does ${topic.subTopic.title} relate to the broader topic of ${topic.title}?`,
        options: [
          "It's completely separate",
          "It provides foundational concepts",
          "It's only tangentially related",
          "It replaces other approaches"
        ],
        correctAnswer: 1,
        explanation: `This sub-topic provides foundational concepts that support the broader understanding of ${topic.title}.`
      }
    ];

    // Ensure we have 10 questions by repeating or adding generic ones
    const questions = [...topicQuestions];
    while (questions.length < 10) {
      questions.push({
        question: `What is an important aspect of ${topic.subTopic.title}?`,
        options: [
          "Understanding key principles",
          "Memorizing facts",
          "Ignoring other views",
          "Accepting everything uncritically"
        ],
        correctAnswer: 0,
        explanation: `Understanding key principles is essential for mastering ${topic.subTopic.title}.`
      });
    }

    return questions.slice(0, 10);
  };

  const handleAnswerSelect = (selectedOption) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(updatedAnswers);

    // Update stats
    const isCorrect = selectedOption === questions[currentQuestionIndex].correctAnswer;
    setQuizStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1,
      total: prev.total + 1
    }));

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      if (mode === 'blind') {
        // In Blind Test, immediately advance to next question (no feedback delay)
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // In Show the Answers, show feedback for 1.5s
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1500);
      }
    } else {
      if (mode === 'blind') {
        setQuizComplete(true);
        setShowResults(true);
      } else {
        setTimeout(() => {
          setQuizComplete(true);
          setShowResults(true);
        }, 1500);
      }
    }
  };

  const getSuccessRate = () => {
    const total = quizStats.correct + quizStats.incorrect;
    if (total === 0) return 0;
    return Math.round((quizStats.correct / total) * 100);
  };

  const saveQuiz = () => {
    const quiz = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: topic.title,
      subTopic: topic.subTopic.title,
      successRate: getSuccessRate(),
      stats: { ...quizStats },
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[index] || null,
        explanation: q.explanation
      }))
    };

    const updatedHistory = [quiz, ...quizHistory].slice(0, 20); // Keep last 20 quizzes
    setQuizHistory(updatedHistory);
    localStorage.setItem(`quiz-history-${topic.subTopic.id}`, JSON.stringify(updatedHistory));
    
    // Return to main quiz view
    setQuizComplete(false);
    setShowResults(false);
    setShowHistory(false);
  };

  const deleteQuiz = () => {
    // Return to main quiz view without saving
    setQuizComplete(false);
    setShowResults(false);
    setShowHistory(false);
  };

  const storeQuiz = () => {
    const quiz = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: topic.title,
      subTopic: topic.subTopic.title,
      successRate: getSuccessRate(),
      stats: { ...quizStats },
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[index] || null,
        explanation: q.explanation
      }))
    };

    const updatedQuizzes = [quiz, ...storedQuizzes].slice(0, 50); // Keep last 50 quizzes
    setStoredQuizzes(updatedQuizzes);
    localStorage.setItem(`quiz-stored-${topic.subTopic.id}`, JSON.stringify(updatedQuizzes));
  };

  const exportQuiz = () => {
    const quizData = {
      topic: topic.title,
      subTopic: topic.subTopic.title,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      successRate: getSuccessRate(),
      stats: quizStats,
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctAnswer],
        userAnswer: userAnswers[index] !== null ? q.options[userAnswers[index]] : 'Not answered',
        explanation: q.explanation
      }))
    };

    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('QUIZ RESULTS', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Topic: ${quizData.topic}`, 10, y); y += 7;
    doc.text(`Sub-Topic: ${quizData.subTopic}`, 10, y); y += 7;
    doc.text(`Date: ${quizData.date}`, 10, y); y += 7;
    doc.text(`Time: ${quizData.time}`, 10, y); y += 7;
    doc.text(`Success Rate: ${quizData.successRate}%`, 10, y); y += 10;
    doc.text(`RESULTS:`, 10, y); y += 7;
    doc.text(`- Correct: ${quizData.stats.correct}`, 10, y); y += 7;
    doc.text(`- Incorrect: ${quizData.stats.incorrect}`, 10, y); y += 10;
    doc.text('DETAILED REVIEW:', 10, y); y += 8;
    quizData.questions.forEach((q, index) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.setFontSize(12);
      doc.text(`Q${index + 1}: ${q.question}`, 10, y); y += 7;
      q.options.forEach((option, optIndex) => {
        doc.text(`${String.fromCharCode(65 + optIndex)}. ${option}`, 14, y); y += 6;
      });
      doc.text(`Your Answer: ${q.userAnswer}`, 14, y); y += 6;
      doc.text(`Correct Answer: ${q.correctAnswer}`, 14, y); y += 6;
      doc.text(`Explanation: ${q.explanation}`, 14, y); y += 8;
    });
    doc.save(`quiz-results-${topic.subTopic.title}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const deleteStoredQuiz = (quizId) => {
    const updatedQuizzes = storedQuizzes.filter(quiz => quiz.id !== quizId);
    setStoredQuizzes(updatedQuizzes);
    localStorage.setItem(`quiz-stored-${topic.subTopic.id}`, JSON.stringify(updatedQuizzes));
  };

  const exportStoredQuiz = (quiz) => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('QUIZ RESULTS', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Topic: ${quiz.topic}`, 10, y); y += 7;
    doc.text(`Sub-Topic: ${quiz.subTopic}`, 10, y); y += 7;
    doc.text(`Date: ${new Date(quiz.timestamp).toLocaleDateString()}`, 10, y); y += 7;
    doc.text(`Time: ${new Date(quiz.timestamp).toLocaleTimeString()}`, 10, y); y += 7;
    doc.text(`Success Rate: ${quiz.successRate}%`, 10, y); y += 10;
    doc.text(`RESULTS:`, 10, y); y += 7;
    doc.text(`- Correct: ${quiz.stats.correct}`, 10, y); y += 7;
    doc.text(`- Incorrect: ${quiz.stats.incorrect}`, 10, y); y += 10;
    doc.text('DETAILED REVIEW:', 10, y); y += 8;
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q, index) => {
        if (y > 270) { doc.addPage(); y = 10; }
        doc.setFontSize(12);
        doc.text(`Q${index + 1}: ${q.question || 'Question not available'}`, 10, y); y += 7;
        if (q.options && Array.isArray(q.options)) {
          q.options.forEach((option, optIndex) => {
            doc.text(`${String.fromCharCode(65 + optIndex)}. ${option}`, 14, y); y += 6;
          });
        }
        doc.text(`Your Answer: ${q.userAnswer !== null && q.userAnswer !== undefined && q.options && q.options[q.userAnswer] ? q.options[q.userAnswer] : 'Not answered'}`, 14, y); y += 6;
        doc.text(`Correct Answer: ${q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : 'Answer not available'}`, 14, y); y += 6;
        doc.text(`Explanation: ${q.explanation || 'No explanation available'}`, 14, y); y += 8;
      });
    }
    doc.save(`quiz-results-${quiz.subTopic}-${new Date(quiz.timestamp).toISOString().split('T')[0]}.pdf`);
  };

  // Helper to extract unique references from explanations
  const getReferencesUsed = () => {
    const refs = new Set();
    questions.forEach(q => {
      const matches = q.explanation.match(/Reference\s*\d+/gi);
      if (matches) matches.forEach(ref => refs.add(ref));
    });
    return Array.from(refs);
  };

  // In the question display, strip 'Reference X' from the explanation
  const cleanExplanation = (explanation) => explanation.replace(/\s*Reference\s*\d+\.?/gi, '').trim();

  // Utility to clean 'Reference X' from questions and options
  const cleanReferenceMentions = (text) => text.replace(/\s*Reference\s*\d+\.?/gi, '').replace(/\(\s*Reference\s*\d+\s*\)/gi, '').trim();

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 flex flex-col justify-center items-center">
        <div className="max-w-xl w-full bg-white border rounded-lg shadow-sm p-8 space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">{topic.subTopic.title} Quiz</h2>
          <p className="text-gray-600 text-center mb-6">Choose your quiz mode:</p>
          <div className="flex justify-center gap-6 mb-6">
            <button
              className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all ${mode === 'blind' ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setMode('blind')}
            >
              Blind Test
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all ${mode === 'show' ? 'bg-purple-600 text-white border-purple-700 shadow-lg' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-50'}`}
              onClick={() => setMode('show')}
            >
              Show the Answers
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${mode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!mode}
              onClick={() => setQuizStarted(true)}
            >
              Start the Quiz
            </button>
          </div>
          <div className="text-center mt-4">
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={onBack}
            >
              ← Back to {topic.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vaultLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <div className="text-lg text-gray-700">Loading study materials...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Practice Quiz
          </h2>
          <div className="bg-white border rounded-lg shadow-sm p-12 max-w-2xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Generating quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quiz History
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStoredQuizzes(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                View Stored Quizzes ({storedQuizzes.length})
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                New Quiz
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {topic.subTopic.title} - Previous Quizzes
            </h3>
            
            {quizHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No quizzes yet</h3>
                <p className="text-gray-600 mb-6">Complete your first quiz to see your progress here.</p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  Start First Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizHistory.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Quiz on {new Date(quiz.timestamp).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(quiz.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{quiz.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{quiz.stats.correct}</div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">{quiz.stats.incorrect}</div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showStoredQuizzes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stored Quizzes
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View History ({quizHistory.length})
              </button>
              <button
                onClick={() => setShowStoredQuizzes(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                New Quiz
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {topic.subTopic.title} - Stored Quizzes
            </h3>
            
            {storedQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No stored quizzes yet</h3>
                <p className="text-gray-600 mb-6">Complete a quiz and store the results to see them here.</p>
                <button
                  onClick={() => setShowStoredQuizzes(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  Start Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {storedQuizzes.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Quiz from {new Date(quiz.timestamp).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(quiz.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{quiz.successRate || 0}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{quiz.stats?.correct || 0}</div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">{quiz.stats?.incorrect || 0}</div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>

                    {/* Detailed Review */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        View Detailed Review
                      </summary>
                      <div className="mt-4 space-y-4">
                        {quiz.questions && quiz.questions.map((q, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="mb-3">
                              <h6 className="font-medium text-gray-800 mb-1">
                                Question {index + 1}:
                              </h6>
                              <p className="text-gray-700 text-sm">{cleanReferenceMentions(q.question || 'Question not available')}</p>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-xs font-medium text-gray-600">Your Answer:</span>
                              <p className="text-gray-700 text-sm bg-white p-2 rounded border">
                                {q.userAnswer !== null && q.userAnswer !== undefined && q.options && q.options[q.userAnswer] 
                                  ? cleanReferenceMentions(q.options[q.userAnswer]) 
                                  : 'Not answered'}
                              </p>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-xs font-medium text-gray-600">Correct Answer:</span>
                              <p className="text-gray-800 text-sm bg-blue-50 p-2 rounded border">
                                {q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer] 
                                  ? cleanReferenceMentions(q.options[q.correctAnswer]) 
                                  : 'Answer not available'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600">Result:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                q.userAnswer === q.correctAnswer
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {q.userAnswer === q.correctAnswer ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => exportStoredQuiz(quiz)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => deleteStoredQuiz(quiz.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Quiz Results
          </h2>

          <div className="bg-white border rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Results</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{quizStats.correct}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">{quizStats.incorrect}</div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <div className="text-xl font-bold text-blue-600">Success Rate: {getSuccessRate()}%</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-gray-800">Question Review</h4>
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Question {index + 1}:
                    </h5>
                    <p className="text-gray-700">{cleanReferenceMentions(question.question)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-700 mb-2">Options:</h6>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`p-3 rounded border ${
                          optIndex === question.correctAnswer 
                            ? 'bg-green-50 border-green-200' 
                            : optIndex === userAnswers[index]
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                            <span className="text-gray-700">{cleanReferenceMentions(option)}</span>
                            {optIndex === question.correctAnswer && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {optIndex === userAnswers[index] && optIndex !== question.correctAnswer && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-gray-700">Your Answer:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userAnswers[index] === question.correctAnswer
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userAnswers[index] === question.correctAnswer ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h6 className="font-medium text-blue-800 mb-2">Explanation:</h6>
                    {mode === 'show' || quizComplete || showResults ? (
                      <p className="text-blue-700 text-sm">{cleanExplanation(question.explanation)}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-4">
                <p className="text-gray-600 font-medium">What would you like to do with these results?</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={saveQuiz}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                  >
                    Save Quiz
                  </button>
                  <button
                    onClick={storeQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Store Results
                  </button>
                  <button
                    onClick={exportQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Export Results
                  </button>
                  <button
                    onClick={deleteQuiz}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete Quiz
                  </button>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowStoredQuizzes(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    View Stored Quizzes ({storedQuizzes.length})
                  </button>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• <strong>Save Quiz:</strong> Stores with quiz history for progress tracking</p>
                  <p>• <strong>Store Results:</strong> Saves detailed results for later reference</p>
                  <p>• <strong>Export Results:</strong> Downloads as text file to your device</p>
                </div>
              </div>
            </div>

            <div className="mt-4"><strong>References Used:</strong> {getReferencesUsed().join(', ')}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {onBack && (
          <div className="flex justify-center mb-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              onClick={onBack}
            >
              ← Back to {topic.title}
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {topic.subTopic.title} Quiz
            </h2>
            <p className="text-gray-600">Test your knowledge with multiple choice questions</p>
          </div>
          <div className="flex gap-3">
            {quizHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View History ({quizHistory.length})
              </button>
            )}
            {storedQuizzes.length > 0 && (
              <button
                onClick={() => setShowStoredQuizzes(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                View Stored ({storedQuizzes.length})
              </button>
            )}
            <button
              onClick={generateQuiz}
              disabled={!vaultLoaded || isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'New Quiz'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="text-center mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Stats */}
        {quizStats.total > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Quiz Progress: {getSuccessRate()}%</span>
              <div className="flex gap-4">
                <span className="text-green-600 font-medium">✓ {quizStats.correct}</span>
                <span className="text-red-500 font-medium">✗ {quizStats.incorrect}</span>
              </div>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="bg-white border rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <div className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Speaker button (fetches audio) */}
              <button
                onClick={async () => {
                  setActiveAudioSection('question');
                  await speak(currentQuestion.question);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  activeAudioSection === 'question' && ttsState === 'playing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={activeAudioSection === 'question' && ttsState === 'playing' ? 'Stop Audio' : 'Fetch Audio'}
                disabled={audioLoading}
              >
                {audioLoading && activeAudioSection === 'question' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <Volume2 className={`w-5 h-5 ${activeAudioSection === 'question' && ttsState === 'playing' ? 'text-blue-800' : 'text-blue-600'}`} />
                )}
              </button>
              {/* Permanent Play button */}
              <button
                onClick={playPreparedAudio}
                disabled={!audioReady || audioLoading}
                className={`p-2 rounded-lg transition-colors ${(!audioReady || audioLoading) ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 text-blue-700 hover:bg-blue-100'}`}
                title="Play audio"
              >
                <Play className="w-5 h-5" />
              </button>
              {/* Pause button */}
              <button
                onClick={pause}
                className={`p-2 rounded-lg transition-colors ${activeAudioSection === 'question' && ttsState === 'paused' ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Pause audio"
              >
                <Pause className={`w-5 h-5 ${activeAudioSection === 'question' && ttsState === 'paused' ? 'text-blue-800' : 'text-blue-600'}`} />
              </button>
              {/* Stop button */}
              <button
                onClick={() => {
                  stop();
                  setActiveAudioSection(null);
                }}
                className={`p-2 rounded-lg transition-colors ${activeAudioSection === 'question' && ttsState === 'idle' ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Stop audio"
              >
                <StopCircle className={`w-5 h-5 ${activeAudioSection === 'question' && ttsState === 'idle' ? 'text-blue-800' : 'text-blue-600'}`} />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Question:</h2>
            <p className="text-xl text-gray-800 leading-relaxed">{cleanReferenceMentions(currentQuestion.question)}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={userAnswers[currentQuestionIndex] !== undefined}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  userAnswers[currentQuestionIndex] === index
                    ? index === currentQuestion.correctAnswer
                      ? 'bg-green-50 border-green-300 ring-2 ring-green-400'
                      : 'bg-red-50 border-red-300 ring-2 ring-red-400'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                } ${userAnswers[currentQuestionIndex] !== undefined ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                    userAnswers[currentQuestionIndex] === index
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-red-500 border-red-500 text-white'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800">{cleanReferenceMentions(option)}</span>
                  {userAnswers[currentQuestionIndex] === index && (
                    <div className="ml-auto">
                      {index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {userAnswers[currentQuestionIndex] !== undefined && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
              {mode === 'show' || quizComplete || showResults ? (
                <p className="text-blue-700">{cleanExplanation(currentQuestion.explanation)}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizView; 
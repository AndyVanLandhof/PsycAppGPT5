import React, { useState, useEffect, useRef } from 'react';
import { getSelectedCurriculum } from '../config/curricula';

const STAGES = [
  { id: 'planning', label: 'Planning', icon: '📋', description: 'Brainstorm your AO1/AO2 points' },
  { id: 'intro', label: 'Introduction', icon: '✍️', description: 'Set up your argument (~100 words)' },
  { id: 'para1', label: 'Paragraph 1', icon: '1️⃣', description: 'First main argument' },
  { id: 'para2', label: 'Paragraph 2', icon: '2️⃣', description: 'Second main argument' },
  { id: 'para3', label: 'Paragraph 3', icon: '3️⃣', description: 'Third argument (optional)' },
  { id: 'conclusion', label: 'Conclusion', icon: '🎯', description: 'Synthesize and answer (~100 words)' },
  { id: 'review', label: 'Final Review', icon: '⭐', description: 'See your complete essay' }
];

// Sample questions for OCR RS Philosophy
const SAMPLE_QUESTIONS = [
  { id: 1, text: 'Critically assess the cosmological argument for the existence of God.', marks: 40, topic: 'Philosophy of Religion' },
  { id: 2, text: '"The teleological argument successfully proves the existence of God." Discuss.', marks: 40, topic: 'Philosophy of Religion' },
  { id: 3, text: 'Assess the view that the ontological argument contains a fatal flaw.', marks: 40, topic: 'Philosophy of Religion' },
  { id: 4, text: 'Critically assess the claim that religious experience provides a convincing argument for the existence of God.', marks: 40, topic: 'Philosophy of Religion' },
  { id: 5, text: '"The problem of evil shows that the God of classical theism cannot exist." Discuss.', marks: 40, topic: 'Philosophy of Religion' },
  { id: 6, text: 'Assess the view that religious language is meaningless.', marks: 40, topic: 'Philosophy of Religion' },
  { id: 7, text: 'Critically assess Natural Law as an approach to ethical decision-making.', marks: 40, topic: 'Ethics' },
  { id: 8, text: '"Situation Ethics is too subjective to be useful." Discuss.', marks: 40, topic: 'Ethics' },
  { id: 9, text: 'Assess Kantian ethics as an approach to business ethics.', marks: 40, topic: 'Ethics' },
  { id: 10, text: 'Critically assess Utilitarian approaches to euthanasia.', marks: 40, topic: 'Ethics' }
];

const EssayCoPilot = ({ onClose }) => {
  // Core state
  const [currentStage, setCurrentStage] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showQuestionSelect, setShowQuestionSelect] = useState(true);
  
  // Essay content state
  const [essayContent, setEssayContent] = useState({
    planning: { ao1: '', ao2: '' },
    intro: '',
    para1: '',
    para2: '',
    para3: '',
    conclusion: ''
  });
  
  // Feedback state
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState({});
  
  // UI state
  const [showExample, setShowExample] = useState(false);
  const textareaRef = useRef(null);

  const currentStageData = STAGES[currentStage];
  const questionText = selectedQuestion?.text || customQuestion;

  // Word count helper
  const getWordCount = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  // Get current content based on stage
  const getCurrentContent = () => {
    const stage = currentStageData.id;
    if (stage === 'planning') {
      return essayContent.planning;
    }
    return essayContent[stage] || '';
  };

  // Update content for current stage
  const updateContent = (value, field = null) => {
    const stage = currentStageData.id;
    if (stage === 'planning' && field) {
      setEssayContent(prev => ({
        ...prev,
        planning: { ...prev.planning, [field]: value }
      }));
    } else {
      setEssayContent(prev => ({
        ...prev,
        [stage]: value
      }));
    }
  };

  // Calculate total word count
  const getTotalWordCount = () => {
    return getWordCount(essayContent.intro) +
           getWordCount(essayContent.para1) +
           getWordCount(essayContent.para2) +
           getWordCount(essayContent.para3) +
           getWordCount(essayContent.conclusion);
  };

  // Get stage-specific prompt
  const getStagePrompt = (stage, content) => {
    const baseContext = `You are a warm but rigorous A-Level examiner/tutor for OCR Religious Studies (H573). The student is writing a 40-mark essay (16 marks AO1 knowledge, 24 marks AO2 evaluation).

Question: "${questionText}"

Your role is to give SPECIFIC, ACTIONABLE feedback to help them write an A/A* essay. Be encouraging but honest. Point out what's good, what's missing, and give concrete suggestions. Keep feedback concise (3-5 bullet points max).`;

    const stagePrompts = {
      planning: `${baseContext}

The student is brainstorming their essay plan. They've listed:

AO1 (Knowledge/Understanding) ideas:
${content.ao1 || '(nothing yet)'}

AO2 (Analysis/Evaluation) ideas:
${content.ao2 || '(nothing yet)'}

Give feedback on:
1. Are the AO1 points sufficient? What key scholars/concepts are missing?
2. Are the AO2 points balanced (arguments AND counter-arguments)?
3. Is there enough material for a full 40-mark essay?
4. Suggest 2-3 specific additions if needed

Rate readiness: "Ready to proceed ✅" or "Needs more work ⚠️" (soft guidance - they can still continue)

Format your response with clear headers and bullet points.`,

      intro: `${baseContext}

Previous planning:
AO1: ${essayContent.planning.ao1}
AO2: ${essayContent.planning.ao2}

The student has written this INTRODUCTION:
"${content}"

Word count: ${getWordCount(content)} (target: 80-120 words)

Give feedback on:
1. Does it clearly address the question?
2. Does it signpost the argument structure?
3. Does it show understanding of key terms?
4. Is the thesis/position clear?

Rate: "Strong intro ✅" or "Could improve ⚠️"`,

      para1: `${baseContext}

Essay so far:
- Intro: "${essayContent.intro}"

The student has written PARAGRAPH 1:
"${content}"

Word count: ${getWordCount(content)} (target: 150-250 words per paragraph)

Check for PEEL structure:
- Point: Clear topic sentence?
- Evidence: Specific scholars/quotes?
- Explain: Analysis of the evidence?
- Link: Connection back to question?

Also check AO balance - is there both knowledge (AO1) AND evaluation (AO2)?

Rate: "Solid paragraph ✅" or "Needs strengthening ⚠️"`,

      para2: `${baseContext}

Essay so far:
- Intro: "${essayContent.intro}"
- Para 1: "${essayContent.para1}"

The student has written PARAGRAPH 2:
"${content}"

Word count: ${getWordCount(content)}

Check:
1. Does it build on paragraph 1 (not repeat)?
2. Does it present a different argument/perspective?
3. Is there counter-argument and response?
4. PEEL structure maintained?

Rate: "Good progression ✅" or "Could develop further ⚠️"`,

      para3: `${baseContext}

Essay so far:
- Intro: "${essayContent.intro}"
- Para 1: "${essayContent.para1}"
- Para 2: "${essayContent.para2}"

The student has written PARAGRAPH 3 (optional but recommended):
"${content}"

${!content || getWordCount(content) < 20 ? 'Note: This paragraph is optional. If they want to skip it, that\'s fine for a solid essay, though a third argument often distinguishes A from A*.' : ''}

Word count: ${getWordCount(content)}

If content provided, check:
1. Does it add new material (not padding)?
2. Is this their strongest argument (often saved for last)?
3. Does it demonstrate sophisticated evaluation?

Rate: "Strong addition ✅" or "Skip this is fine" or "Could strengthen ⚠️"`,

      conclusion: `${baseContext}

Full essay so far:
- Intro: "${essayContent.intro}"
- Para 1: "${essayContent.para1}"
- Para 2: "${essayContent.para2}"
- Para 3: "${essayContent.para3}"

The student has written this CONCLUSION:
"${content}"

Word count: ${getWordCount(content)} (target: 80-120 words)

Check:
1. Does it SYNTHESIZE (not just repeat) the arguments?
2. Does it give a clear, justified ANSWER to the question?
3. Does it show which argument is strongest and why?
4. Does it avoid introducing new material?

Rate: "Strong conclusion ✅" or "Needs sharpening ⚠️"`,

      review: `${baseContext}

COMPLETE ESSAY:

Introduction:
"${essayContent.intro}"

Paragraph 1:
"${essayContent.para1}"

Paragraph 2:
"${essayContent.para2}"

${essayContent.para3 ? `Paragraph 3:\n"${essayContent.para3}"` : '(No paragraph 3)'}

Conclusion:
"${essayContent.conclusion}"

Total word count: ${getTotalWordCount()}

Provide a FINAL ASSESSMENT:
1. Estimated grade band (and what would push it higher)
2. AO1 strengths and gaps
3. AO2 strengths and gaps  
4. Overall structure and coherence
5. Top 3 improvements for next time

Be specific and constructive. This is their completed essay - celebrate what works!`
    };

    return stagePrompts[stage] || baseContext;
  };

  // Fetch feedback from AI
  const getFeedback = async () => {
    const stage = currentStageData.id;
    const content = getCurrentContent();
    
    // Don't get feedback if no content
    if (stage === 'planning') {
      if (!content.ao1 && !content.ao2) {
        setFeedback({ type: 'info', message: 'Start by listing some AO1 and AO2 ideas above!' });
        return;
      }
    } else if (stage === 'review') {
      // Review stage doesn't need content validation - it reviews the whole essay
    } else if (!content || typeof content !== 'string' || getWordCount(content) < 10) {
      setFeedback({ type: 'info', message: 'Write a bit more before getting feedback!' });
      return;
    }

    setFeedbackLoading(true);
    setFeedback(null);

    try {
      const prompt = getStagePrompt(stage, content);
      
      const response = await fetch('/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini'
        })
      });

      if (!response.ok) throw new Error('Failed to get feedback');
      
      const data = await response.json();
      const feedbackText = data.choices?.[0]?.message?.content || 'No feedback available';
      
      const newFeedback = {
        type: 'success',
        message: feedbackText,
        timestamp: new Date().toISOString()
      };
      
      setFeedback(newFeedback);
      setFeedbackHistory(prev => ({
        ...prev,
        [stage]: [...(prev[stage] || []), newFeedback]
      }));
      
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedback({ 
        type: 'error', 
        message: 'Could not get feedback. Check your connection and try again.' 
      });
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Navigation
  const goToStage = (index) => {
    if (index >= 0 && index < STAGES.length) {
      setCurrentStage(index);
      setFeedback(feedbackHistory[STAGES[index].id]?.slice(-1)[0] || null);
    }
  };

  const nextStage = () => goToStage(currentStage + 1);
  const prevStage = () => goToStage(currentStage - 1);

  // Start essay with selected question
  const startEssay = () => {
    if (questionText) {
      setShowQuestionSelect(false);
    }
  };

  // Question selection screen
  if (showQuestionSelect) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">✍️ Essay Co-Pilot</h1>
                <p className="text-indigo-200 mt-1">Guided essay writing with real-time feedback</p>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose a question to practice:</h2>
            
            {/* Sample questions */}
            <div className="space-y-3 mb-6">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedQuestion?.id === q.id
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-gray-800 font-medium">{q.text}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2 whitespace-nowrap">
                      {q.marks} marks
                    </span>
                  </div>
                  <span className="text-xs text-indigo-600 mt-1 inline-block">{q.topic}</span>
                </button>
              ))}
            </div>

            {/* Custom question */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Or enter your own question:</h3>
              <textarea
                value={customQuestion}
                onChange={(e) => {
                  setCustomQuestion(e.target.value);
                  setSelectedQuestion(null);
                }}
                placeholder="Type your essay question here..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows={3}
              />
            </div>

            {/* Start button */}
            <button
              onClick={startEssay}
              disabled={!questionText}
              className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                questionText
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Start Essay Co-Pilot →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main essay writing interface
  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-white/80 hover:text-white">
              ← Exit
            </button>
            <div>
              <h1 className="font-bold">Essay Co-Pilot</h1>
              <p className="text-xs text-indigo-200 truncate max-w-md">"{questionText}"</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {getTotalWordCount()} words
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1">
            {STAGES.map((stage, index) => (
              <button
                key={stage.id}
                onClick={() => goToStage(index)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  index === currentStage
                    ? 'bg-indigo-600 text-white'
                    : index < currentStage
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">{stage.icon} </span>
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content - split pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane - Writing area */}
        <div className="w-1/2 flex flex-col border-r bg-white">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              {currentStageData.icon} {currentStageData.label}
            </h2>
            <p className="text-sm text-gray-600">{currentStageData.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentStageData.id === 'planning' ? (
              /* Planning stage - two textareas */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    📘 AO1 Ideas (Knowledge & Understanding)
                  </label>
                  <textarea
                    value={essayContent.planning.ao1}
                    onChange={(e) => updateContent(e.target.value, 'ao1')}
                    placeholder="List your key points, scholars, concepts, definitions...&#10;&#10;e.g.&#10;- Aquinas' Five Ways (motion, causation, contingency)&#10;- Leibniz's Principle of Sufficient Reason&#10;- Kalam cosmological argument"
                    className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none bg-blue-50/50"
                    rows={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    📗 AO2 Ideas (Analysis & Evaluation)
                  </label>
                  <textarea
                    value={essayContent.planning.ao2}
                    onChange={(e) => updateContent(e.target.value, 'ao2')}
                    placeholder="List arguments FOR and AGAINST, critiques, responses...&#10;&#10;e.g.&#10;FOR: Explains existence, intuitive&#10;AGAINST: Hume - can't apply causation beyond experience&#10;AGAINST: Russell - universe is just a brute fact&#10;RESPONSE: Copleston's radio analogy"
                    className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none bg-green-50/50"
                    rows={8}
                  />
                </div>
              </div>
            ) : currentStageData.id === 'review' ? (
              /* Review stage - show full essay */
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">📝 Your Complete Essay</h3>
                  <div className="space-y-4 text-gray-800">
                    {essayContent.intro && (
                      <div>
                        <span className="text-xs font-medium text-indigo-600">Introduction</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.intro}</p>
                      </div>
                    )}
                    {essayContent.para1 && (
                      <div>
                        <span className="text-xs font-medium text-indigo-600">Paragraph 1</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.para1}</p>
                      </div>
                    )}
                    {essayContent.para2 && (
                      <div>
                        <span className="text-xs font-medium text-indigo-600">Paragraph 2</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.para2}</p>
                      </div>
                    )}
                    {essayContent.para3 && (
                      <div>
                        <span className="text-xs font-medium text-indigo-600">Paragraph 3</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.para3}</p>
                      </div>
                    )}
                    {essayContent.conclusion && (
                      <div>
                        <span className="text-xs font-medium text-indigo-600">Conclusion</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.conclusion}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center text-gray-500 text-sm">
                  Click "Get Final Assessment" to receive overall feedback →
                </div>
              </div>
            ) : (
              /* Regular writing stages */
              <div>
                <textarea
                  ref={textareaRef}
                  value={essayContent[currentStageData.id] || ''}
                  onChange={(e) => updateContent(e.target.value)}
                  placeholder={
                    currentStageData.id === 'intro'
                      ? "Write your introduction here...\n\nTip: Start by defining key terms, then signpost your argument structure."
                      : currentStageData.id === 'conclusion'
                      ? "Write your conclusion here...\n\nTip: Synthesize (don't repeat), give a clear verdict, explain why."
                      : "Write your paragraph here...\n\nStructure: Point → Evidence → Explain → Link back to question"
                  }
                  className="w-full h-full min-h-[400px] p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-gray-800 leading-relaxed"
                />
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>
                    {getWordCount(essayContent[currentStageData.id] || '')} words
                    {currentStageData.id === 'intro' || currentStageData.id === 'conclusion'
                      ? ' (target: 80-120)'
                      : ' (target: 150-250)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="p-4 border-t bg-gray-50 flex justify-between">
            <button
              onClick={prevStage}
              disabled={currentStage === 0}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentStage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={nextStage}
              disabled={currentStage === STAGES.length - 1}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentStage === STAGES.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right pane - Feedback area */}
        <div className="w-1/2 flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
          <div className="p-4 border-b bg-amber-100/50">
            <h2 className="font-bold text-amber-800 flex items-center gap-2">
              🎓 Coach Feedback
            </h2>
            <p className="text-sm text-amber-700">Get guidance on your current section</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {feedbackLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-amber-700">Reviewing your work...</p>
                </div>
              </div>
            ) : feedback ? (
              <div className={`rounded-xl p-4 ${
                feedback.type === 'error' 
                  ? 'bg-red-100 border border-red-200' 
                  : feedback.type === 'info'
                  ? 'bg-blue-100 border border-blue-200'
                  : 'bg-white border border-amber-200 shadow-sm'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {feedback.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <div className="text-5xl mb-4">💭</div>
                  <p className="font-medium">Ready when you are!</p>
                  <p className="text-sm mt-2">Write something, then click<br/>"Get Feedback" below</p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback button */}
          <div className="p-4 border-t bg-amber-100/50">
            <button
              onClick={getFeedback}
              disabled={feedbackLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                feedbackLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg'
              }`}
            >
              {feedbackLoading 
                ? '⏳ Getting feedback...' 
                : currentStageData.id === 'review'
                ? '⭐ Get Final Assessment'
                : '💬 Get Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayCoPilot;

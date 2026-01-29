import React, { useState, useEffect, useRef } from 'react';
import { getSelectedCurriculum } from '../config/curricula';

const STAGES = [
  { id: 'planning', label: 'Planning', icon: '📋', description: 'Thesis + Arguments FOR and AGAINST' },
  { id: 'intro', label: 'Introduction', icon: '✍️', description: 'State your thesis clearly (~80-100 words)' },
  { id: 'argument', label: 'Your Argument', icon: '💪', description: 'Present your main case with scholars' },
  { id: 'counter', label: 'Challenge & Response', icon: '⚔️', description: 'Counter-argument, then respond to it' },
  { id: 'alternative', label: 'Alternative View', icon: '🔄', description: 'Present opposing position, then critique' },
  { id: 'conclusion', label: 'Conclusion', icon: '🎯', description: 'Synthesize - clear verdict with justification (~100 words)' },
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
    planning: { thesis: '', argumentsFor: '', argumentsAgainst: '' },
    intro: '',
    argument: '',
    counter: '',
    alternative: '',
    conclusion: ''
  });
  
  // Feedback state
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState({});
  
  // Help Me Out state
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
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
           getWordCount(essayContent.argument) +
           getWordCount(essayContent.counter) +
           getWordCount(essayContent.alternative) +
           getWordCount(essayContent.conclusion);
  };

  // Get stage-specific prompt
  const getStagePrompt = (stage, content) => {
    const baseContext = `You are a warm but rigorous A-Level examiner/tutor for OCR Religious Studies (H573). The student is writing a 40-mark essay (16 marks AO1 knowledge, 24 marks AO2 evaluation).

Question: "${questionText}"

OCR rewards DIALECTICAL essays: Thesis → Argument → Challenge → Response → Alternative → Critique → Synthesis. The examiner wants to see "a line of reasoning which is coherent, relevant and logically structured."

Your role is to give SPECIFIC, ACTIONABLE feedback to help them write an A/A* essay. Be encouraging but honest. Point out what's good, what's missing, and give concrete suggestions. Keep feedback concise (3-5 bullet points max).`;

    const stagePrompts = {
      planning: `${baseContext}

The student is planning their dialectical essay. They've written:

THESIS (their position on the question):
${content.thesis || '(not yet stated)'}

ARGUMENTS FOR their position:
${content.argumentsFor || '(nothing yet)'}

ARGUMENTS AGAINST / Counter-arguments to address:
${content.argumentsAgainst || '(nothing yet)'}

Give feedback on:
1. Is the thesis clear and directly answering the question?
2. Are there enough arguments FOR (aim for 2-3 with scholars)?
3. Are there genuine counter-arguments listed (not straw men)?
4. Do they have scholars/evidence for both sides?
5. Is there enough material for a 40-mark dialectical essay?

Suggest specific scholars or arguments they might be missing.

Rate readiness: "Ready to proceed ✅" or "Needs more work ⚠️" (soft guidance - they can still continue)

Format your response with clear headers and bullet points.`,

      intro: `${baseContext}

Their planning:
- Thesis: ${essayContent.planning.thesis || '(not stated)'}
- Arguments FOR: ${essayContent.planning.argumentsFor || '(none)'}
- Arguments AGAINST: ${essayContent.planning.argumentsAgainst || '(none)'}

The student has written this INTRODUCTION:
"${content}"

Word count: ${getWordCount(content)} (target: 80-100 words)

For OCR, a strong intro should:
1. Define any key terms in the question
2. State their THESIS clearly (their answer to the question)
3. Briefly signpost how they'll argue (what perspectives they'll examine)

Check:
- Is the thesis statement clear and direct?
- Does it show they understand what the question is asking?
- Does it hint at the dialectical structure to come?

Rate: "Strong thesis ✅" or "Could sharpen ⚠️"`,

      argument: `${baseContext}

Essay so far:
- Intro: "${essayContent.intro}"

The student has written their MAIN ARGUMENT section:
"${content}"

Word count: ${getWordCount(content)} (target: 200-300 words)

This section should present their STRONGEST CASE with:
- Key scholars supporting their position (e.g., Aquinas, Kant, Hume)
- Specific evidence/arguments from those scholars
- Clear explanation of WHY this supports their thesis
- Some analysis woven in (not just description)

Check:
1. Are scholars named and their arguments explained?
2. Is there genuine AO1 (knowledge) AND AO2 (analysis)?
3. Does it clearly support the thesis from the intro?
4. Is it substantive enough to be convincing?

Rate: "Strong argument ✅" or "Needs more depth ⚠️"`,

      counter: `${baseContext}

Essay so far:
- Intro: "${essayContent.intro}"
- Main argument: "${essayContent.argument}"

The student has written their CHALLENGE & RESPONSE section:
"${content}"

Word count: ${getWordCount(content)} (target: 200-300 words)

This section should:
1. Present a GENUINE challenge to their argument (not a straw man)
2. Use a scholar who disagrees (e.g., if arguing FOR God, use Hume/Russell)
3. Then RESPOND to the challenge - defend their position
4. Show they understand BOTH sides

Check:
- Is the counter-argument genuinely strong (steel man, not straw man)?
- Is there a named scholar for the counter-argument?
- Does their response actually ADDRESS the challenge?
- Is this dialectical (not just listing views)?

Rate: "Good dialectic ✅" or "Challenge/response needs work ⚠️"`,

      alternative: `${baseContext}

Essay so far:
- Intro: "${essayContent.intro}"
- Main argument: "${essayContent.argument}"
- Challenge & response: "${essayContent.counter}"

The student has written their ALTERNATIVE VIEW & CRITIQUE section:
"${content}"

Word count: ${getWordCount(content)} (target: 200-300 words)

This section should:
1. Present an ALTERNATIVE position fairly (the opposing view)
2. Use scholars who hold that view
3. Then CRITIQUE that alternative - show its weaknesses
4. Explain why their original thesis is stronger

This is where they show sophisticated evaluation - they understand the opposition but can explain why it fails.

Check:
- Is the alternative view presented fairly and accurately?
- Are there named scholars for this alternative?
- Is the critique of the alternative convincing?
- Does this strengthen their overall thesis?

Rate: "Sophisticated evaluation ✅" or "Could develop critique ⚠️"`,

      conclusion: `${baseContext}

Full essay so far:
- Intro: "${essayContent.intro}"
- Main argument: "${essayContent.argument}"
- Challenge & response: "${essayContent.counter}"
- Alternative & critique: "${essayContent.alternative}"

The student has written this CONCLUSION:
"${content}"

Word count: ${getWordCount(content)} (target: 80-120 words)

OCR wants conclusions that "re-assemble the pieces" - SYNTHESIZE, don't just repeat.

Check:
1. Does it give a CLEAR VERDICT (answering the question directly)?
2. Does it explain WHY their thesis is the stronger position?
3. Does it acknowledge nuance (the strongest counter-argument)?
4. Does it avoid introducing new material?
5. Does it feel like a natural conclusion to the argument?

Rate: "Strong synthesis ✅" or "Needs to be more decisive ⚠️"`,

      review: `${baseContext}

COMPLETE ESSAY:

Introduction:
"${essayContent.intro}"

Main Argument:
"${essayContent.argument}"

Challenge & Response:
"${essayContent.counter}"

Alternative View & Critique:
"${essayContent.alternative}"

Conclusion:
"${essayContent.conclusion}"

Total word count: ${getTotalWordCount()}

Provide a FINAL ASSESSMENT using OCR criteria:

**AO1 (16 marks) - Knowledge & Understanding:**
- Range of scholars used?
- Accuracy of knowledge?
- Relevant selection for the question?
- Estimated AO1 mark: X/16

**AO2 (24 marks) - Analysis & Evaluation:**
- Clear line of reasoning?
- Genuine dialectic (argument ↔ counter)?
- Evaluation woven throughout (not bolted on)?
- Coherent and logical structure?
- Estimated AO2 mark: X/24

**Overall:**
- Estimated total: X/40 (Grade: ?)
- What would push it to the next grade?
- Top 3 specific improvements

Be specific and constructive. Celebrate what works!`
    };

    return stagePrompts[stage] || baseContext;
  };

  // Fetch feedback from AI
  const getFeedback = async () => {
    const stage = currentStageData.id;
    const content = getCurrentContent();
    
    // Don't get feedback if no content
    if (stage === 'planning') {
      if (!content.thesis && !content.argumentsFor && !content.argumentsAgainst) {
        setFeedback({ type: 'info', message: 'Start by writing your thesis and listing arguments above!' });
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

  // Help Me Out function
  const getHelp = async () => {
    const stage = currentStageData.id;
    const content = getCurrentContent();
    
    setHelpLoading(true);
    setHelpContent(null);
    setShowHelpModal(true);

    try {
      const helpPrompts = {
        planning: `You are helping an A-Level student plan an OCR Religious Studies essay (40 marks: 16 AO1, 24 AO2).

Question: "${questionText}"

The student is stuck on planning. Give them SPECIFIC, CONCRETE suggestions they can use:

1. **Suggested Thesis** (1-2 sentences they could use or adapt)

2. **Key Arguments FOR** (3 bullet points with specific scholars):
   - [Scholar]: [Their specific argument]
   - [Scholar]: [Their specific argument]
   - [Scholar]: [Their specific argument]

3. **Key Arguments AGAINST** (3 bullet points with specific scholars):
   - [Scholar]: [Their counter-argument]
   - [Scholar]: [Their counter-argument]
   - [Scholar]: [Their counter-argument]

Be specific with names, concepts, and brief explanations. Make it easy to copy and use.`,

        intro: `You are helping an A-Level student write their introduction for an OCR Religious Studies essay.

Question: "${questionText}"

Their thesis from planning: ${essayContent.planning.thesis || '(not stated yet)'}

Give them a MODEL INTRODUCTION they can learn from or adapt (80-100 words):

**Example Introduction:**
[Write a strong introduction that:
- Defines key terms
- States a clear thesis
- Briefly signposts the argument structure]

Then explain briefly WHY this introduction works.`,

        argument: `You are helping an A-Level student write their main argument section for an OCR Religious Studies essay.

Question: "${questionText}"
Their thesis: ${essayContent.planning.thesis || '(not stated)'}
Their planned arguments FOR: ${essayContent.planning.argumentsFor || '(none listed)'}

Give them a MODEL PARAGRAPH they can learn from or adapt (200-250 words):

**Example Main Argument:**
[Write a strong argument section that:
- Uses 2-3 named scholars with their specific arguments
- Explains WHY these arguments support the thesis
- Weaves in analysis, not just description]

Then list the KEY SCHOLARS and their arguments they should definitely mention.`,

        counter: `You are helping an A-Level student write their challenge & response section.

Question: "${questionText}"
Their thesis: ${essayContent.planning.thesis || '(not stated)'}
Challenges they planned: ${essayContent.planning.argumentsAgainst || '(none listed)'}

Give them a MODEL PARAGRAPH they can learn from or adapt (200-250 words):

**Example Challenge & Response:**
[Write a strong section that:
- Presents a genuine challenge using a named scholar
- Explains the counter-argument fairly (steel man, not straw man)
- Then RESPONDS to defend the thesis
- Shows understanding of both sides]

Then list the BEST COUNTER-ARGUMENTS to use with specific scholars.`,

        alternative: `You are helping an A-Level student write their alternative view & critique section.

Question: "${questionText}"
Their thesis: ${essayContent.planning.thesis || '(not stated)'}

Give them a MODEL PARAGRAPH they can learn from or adapt (200-250 words):

**Example Alternative View & Critique:**
[Write a strong section that:
- Presents an alternative philosophical position fairly
- Uses named scholars who hold that view
- Then CRITIQUES that view effectively
- Shows why the original thesis is stronger]

Then list ALTERNATIVE POSITIONS they could discuss with scholars.`,

        conclusion: `You are helping an A-Level student write their conclusion.

Question: "${questionText}"
Their thesis: ${essayContent.planning.thesis || '(not stated)'}
Their essay so far covers: Main argument, challenge/response, alternative view

Give them a MODEL CONCLUSION they can learn from or adapt (80-100 words):

**Example Conclusion:**
[Write a strong conclusion that:
- Gives a clear VERDICT (answers the question directly)
- Explains WHY their thesis is the stronger position
- Acknowledges the strongest counter-point
- Synthesizes (doesn't just repeat)]

Then explain what makes this conclusion effective.`,

        review: `No help needed for review stage - just click "Get Final Assessment" to see your feedback!`
      };

      const prompt = helpPrompts[stage] || 'Help is not available for this stage.';
      
      const response = await fetch('/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini'
        })
      });

      if (!response.ok) throw new Error('Failed to get help');
      
      const data = await response.json();
      const helpText = data.choices?.[0]?.message?.content || 'No help available';
      
      setHelpContent(helpText);
      
    } catch (error) {
      console.error('Help error:', error);
      setHelpContent('Sorry, could not load help. Please try again.');
    } finally {
      setHelpLoading(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
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
              /* Planning stage - thesis and arguments */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    🎯 Your Thesis (What's your answer to the question?)
                  </label>
                  <textarea
                    value={essayContent.planning.thesis}
                    onChange={(e) => updateContent(e.target.value, 'thesis')}
                    placeholder="State your position clearly in 1-2 sentences...&#10;&#10;e.g. 'The cosmological argument provides a reasonable basis for belief in God, though it does not constitute definitive proof.'"
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none bg-purple-50/50"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    💪 Arguments FOR your thesis (with scholars)
                  </label>
                  <textarea
                    value={essayContent.planning.argumentsFor}
                    onChange={(e) => updateContent(e.target.value, 'argumentsFor')}
                    placeholder="List 2-3 arguments supporting your position...&#10;&#10;e.g.&#10;- Aquinas' Five Ways (motion, causation, contingency)&#10;- Leibniz's Principle of Sufficient Reason&#10;- Copleston's radio analogy in BBC debate"
                    className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none bg-blue-50/50"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    ⚔️ Arguments AGAINST / Counter-arguments (with scholars)
                  </label>
                  <textarea
                    value={essayContent.planning.argumentsAgainst}
                    onChange={(e) => updateContent(e.target.value, 'argumentsAgainst')}
                    placeholder="List challenges you'll need to address...&#10;&#10;e.g.&#10;- Hume: can't apply causation beyond experience&#10;- Russell: universe is a 'brute fact', no explanation needed&#10;- Kant: causation only applies within the phenomenal world"
                    className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none resize-none bg-red-50/50"
                    rows={6}
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
                    {essayContent.argument && (
                      <div>
                        <span className="text-xs font-medium text-blue-600">Your Main Argument</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.argument}</p>
                      </div>
                    )}
                    {essayContent.counter && (
                      <div>
                        <span className="text-xs font-medium text-orange-600">Challenge & Response</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.counter}</p>
                      </div>
                    )}
                    {essayContent.alternative && (
                      <div>
                        <span className="text-xs font-medium text-purple-600">Alternative View & Critique</span>
                        <p className="mt-1 whitespace-pre-wrap">{essayContent.alternative}</p>
                      </div>
                    )}
                    {essayContent.conclusion && (
                      <div>
                        <span className="text-xs font-medium text-green-600">Conclusion</span>
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
                      ? "Write your introduction here...\n\nTip: Define key terms, state your THESIS clearly, briefly signpost how you'll argue."
                      : currentStageData.id === 'argument'
                      ? "Present your MAIN ARGUMENT here...\n\nInclude:\n• Named scholars who support your position\n• Their specific arguments/evidence\n• Why this supports your thesis\n\nAim for 200-300 words with real depth."
                      : currentStageData.id === 'counter'
                      ? "Present a CHALLENGE to your argument, then RESPOND to it...\n\nStructure:\n1. 'However, [Scholar] argues that...'\n2. Explain their counter-argument fairly\n3. 'Nevertheless, this can be challenged because...'\n4. Defend your position\n\nShow you understand both sides!"
                      : currentStageData.id === 'alternative'
                      ? "Present the ALTERNATIVE VIEW, then CRITIQUE it...\n\nStructure:\n1. 'An alternative perspective is [Scholar's] view that...'\n2. Explain their position fairly\n3. 'However, this view fails because...'\n4. Show why your thesis is stronger\n\nThis is where you show sophisticated evaluation."
                      : currentStageData.id === 'conclusion'
                      ? "Write your conclusion here...\n\nSYNTHESIZE (don't just repeat):\n• Give a clear VERDICT answering the question\n• Explain WHY your thesis is the stronger position\n• Acknowledge the strongest counter-point\n• No new material!"
                      : "Write here..."
                  }
                  className="w-full h-full min-h-[400px] p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-gray-800 leading-relaxed"
                />
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>
                    {getWordCount(essayContent[currentStageData.id] || '')} words
                    {currentStageData.id === 'intro' || currentStageData.id === 'conclusion'
                      ? ' (target: 80-120)'
                      : ' (target: 200-300)'}
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
          <div className="p-4 border-t bg-amber-100/50 space-y-2">
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
            
            {currentStageData.id !== 'review' && (
              <button
                onClick={getHelp}
                disabled={helpLoading}
                className="w-full py-2 rounded-xl font-medium text-sm border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
              >
                {helpLoading ? '⏳ Loading help...' : '🆘 Help Me Out'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help Me Out Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">🆘 Help Me Out</h2>
                <p className="text-purple-200 text-sm">Suggestions for: {currentStageData.label}</p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {helpLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-purple-700">Generating suggestions...</p>
                  </div>
                </div>
              ) : helpContent ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {helpContent}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No help content available.</p>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  if (helpContent) copyToClipboard(helpContent);
                }}
                disabled={!helpContent}
                className="flex-1 py-2 px-4 rounded-lg font-medium text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📋 Copy All
              </button>
              <button
                onClick={() => setShowHelpModal(false)}
                className="flex-1 py-2 px-4 rounded-lg font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayCoPilot;

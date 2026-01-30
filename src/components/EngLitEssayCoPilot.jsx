import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, BookOpen, Theater, FileText, Feather } from 'lucide-react';

/**
 * Essay Co-Pilot for Edexcel English Literature
 * Adapts structure based on text type: Drama, Prose, or Poetry
 */
export default function EngLitEssayCoPilot({ onClose }) {
  // Setup state
  const [textType, setTextType] = useState(null); // 'drama', 'prose', 'poetry'
  const [questionText, setQuestionText] = useState('');
  const [started, setStarted] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Essay content state
  const [essayContent, setEssayContent] = useState({
    planning: { thesis: '', ao2Points: '', ao3Context: '', ao5Critics: '' },
    introduction: '',
    analysis1: '',
    analysis2: '',
    analysis3: '',
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

  // Sample questions by text type
  const sampleQuestions = {
    drama: [
      "Explore the significance of grief in Hamlet.",
      "How does Shakespeare present the theme of madness in Hamlet?",
      "'Hamlet is a play about inaction.' Discuss.",
      "Examine the role of women in Hamlet.",
      "How does Beckett present the passage of time in Waiting for Godot?"
    ],
    prose: [
      "Explore the significance of darkness in Heart of Darkness.",
      "How does Conrad present imperialism in Heart of Darkness?",
      "'Marlow is as morally compromised as Kurtz.' Discuss.",
      "Examine the role of the frame narrative in Heart of Darkness.",
      "How does Selvon present London in The Lonely Londoners?"
    ],
    poetry: [
      "Compare how poets present the theme of loss in two poems.",
      "Explore how form and structure contribute to meaning in two poems.",
      "Compare how poets use imagery to present nature.",
      "'Poetry is a means of resistance.' Discuss with reference to two poems."
    ]
  };

  // Stage definitions by text type
  const stagesByType = {
    drama: [
      { id: 'planning', title: '📋 Planning Your Essay', targetWords: 'N/A', 
        description: 'Map out your thesis, key moments, and critical angles' },
      { id: 'introduction', title: '✍️ Introduction', targetWords: '80-120 words',
        description: 'Define terms, state thesis, signpost your argument' },
      { id: 'analysis1', title: '🎭 Scene Analysis', targetWords: '200-300 words',
        description: 'Close analysis of a key scene/moment with AO2 focus' },
      { id: 'analysis2', title: '👤 Character & Performance', targetWords: '200-300 words',
        description: 'How character/staging reinforces meaning' },
      { id: 'analysis3', title: '📚 Context & Critics', targetWords: '200-300 words',
        description: 'AO3 context + AO5 critical perspectives' },
      { id: 'conclusion', title: '🎯 Conclusion', targetWords: '80-120 words',
        description: 'Synthesise and deliver your verdict' },
      { id: 'review', title: '⭐ Final Review', targetWords: 'N/A',
        description: 'See your complete essay with full assessment' }
    ],
    prose: [
      { id: 'planning', title: '📋 Planning Your Essay', targetWords: 'N/A',
        description: 'Map out your thesis, key passages, and critical angles' },
      { id: 'introduction', title: '✍️ Introduction', targetWords: '80-120 words',
        description: 'Define terms, state thesis, signpost your argument' },
      { id: 'analysis1', title: '📖 Close Reading', targetWords: '200-300 words',
        description: 'Detailed analysis of a key passage with AO2 focus' },
      { id: 'analysis2', title: '🔍 Narrative Technique', targetWords: '200-300 words',
        description: 'Voice, perspective, structure, imagery' },
      { id: 'analysis3', title: '📚 Context & Critics', targetWords: '200-300 words',
        description: 'AO3 context + AO5 critical perspectives' },
      { id: 'conclusion', title: '🎯 Conclusion', targetWords: '80-120 words',
        description: 'Synthesise and deliver your verdict' },
      { id: 'review', title: '⭐ Final Review', targetWords: 'N/A',
        description: 'See your complete essay with full assessment' }
    ],
    poetry: [
      { id: 'planning', title: '📋 Planning Your Essay', targetWords: 'N/A',
        description: 'Map out your thesis and points of comparison' },
      { id: 'introduction', title: '✍️ Introduction', targetWords: '80-120 words',
        description: 'Introduce both poems, state thesis, signpost comparison' },
      { id: 'analysis1', title: '📝 Poem 1 Analysis', targetWords: '250-350 words',
        description: 'Detailed analysis of first poem (AO2 focus)' },
      { id: 'analysis2', title: '📝 Poem 2 Analysis', targetWords: '250-350 words',
        description: 'Detailed analysis of second poem with comparison threads' },
      { id: 'analysis3', title: '🔗 Synthesis & Context', targetWords: '150-200 words',
        description: 'Draw comparisons together, add AO3 context' },
      { id: 'conclusion', title: '🎯 Conclusion', targetWords: '80-120 words',
        description: 'Final comparison and verdict' },
      { id: 'review', title: '⭐ Final Review', targetWords: 'N/A',
        description: 'See your complete essay with full assessment' }
    ]
  };

  const stages = textType ? stagesByType[textType] : [];
  const currentStageData = stages[currentStageIndex] || {};

  // Word count helper
  const getWordCount = (text) => {
    if (typeof text !== 'string') {
      if (typeof text === 'object' && text !== null) {
        const combined = Object.values(text).filter(v => typeof v === 'string').join(' ');
        return combined.split(/\s+/).filter(word => word.length > 0).length;
      }
      return 0;
    }
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getTotalWordCount = () => {
    return getWordCount(essayContent.introduction) +
           getWordCount(essayContent.analysis1) +
           getWordCount(essayContent.analysis2) +
           getWordCount(essayContent.analysis3) +
           getWordCount(essayContent.conclusion);
  };

  const getCurrentContent = () => {
    const stage = currentStageData.id;
    if (stage === 'planning') return essayContent.planning;
    return essayContent[stage] || '';
  };

  // Strip markdown from responses
  const stripMarkdown = (text) => {
    if (!text) return text;
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .trim();
  };

  // Get text type label
  const getTextTypeLabel = () => {
    const labels = { drama: 'Drama', prose: 'Prose', poetry: 'Poetry' };
    return labels[textType] || '';
  };

  // Build stage-specific prompt
  const getStagePrompt = (stage, content) => {
    const aoDescriptions = {
      drama: `AO1: Articulate informed personal response with accurate terminology
AO2: Analyse how meanings are shaped by language, form, structure (stagecraft, dialogue, soliloquy)
AO3: Understanding of contexts (Elizabethan/Jacobean, theatrical conventions, historical)
AO5: Explore different interpretations (critics like Bradley, Granville-Barker, Wilson Knight)`,
      prose: `AO1: Articulate informed personal response with accurate terminology  
AO2: Analyse how meanings are shaped by language, form, structure (narrative voice, imagery, symbolism)
AO3: Understanding of contexts (colonial, historical, literary)
AO5: Explore different interpretations (critics like Achebe, Leavis, Said)`,
      poetry: `AO1: Articulate informed personal response with accurate terminology
AO2: Analyse how meanings are shaped by language, form, structure (meter, rhyme, imagery)
AO3: Understanding of contexts (historical, literary movements, biographical)
AO4: Connections across texts (comparison of poems)`
    };

    const baseContext = `You are an expert Edexcel A-Level English Literature coach, helping a student write a ${textType === 'poetry' ? '30' : '35'}-mark essay.

Question: "${questionText}"
Text type: ${getTextTypeLabel()}

Edexcel Assessment Objectives:
${aoDescriptions[textType]}

Key principles:
- Close textual analysis is paramount (quotes with technique + effect)
- Critics should be used to enrich, not replace, personal response
- Context should illuminate the text, not dominate
- Language/form/structure analysis (AO2) is heavily weighted`;

    const typeSpecificGuidance = {
      drama: `For drama essays:
- Discuss stagecraft and performance possibilities
- Consider soliloquy vs dialogue
- Reference act/scene locations
- Think about audience reception`,
      prose: `For prose essays:
- Analyse narrative voice and perspective
- Consider structure and pacing
- Examine imagery patterns and symbolism
- Think about the reading experience`,
      poetry: `For poetry comparison:
- Analyse both poems in depth
- Draw explicit comparisons throughout
- Consider form, meter, and structure
- Balance treatment of both poems`
    };

    const stagePrompts = {
      planning: `${baseContext}

${typeSpecificGuidance[textType]}

The student is in the PLANNING stage. They have provided:

Thesis: "${content.thesis || '(not provided)'}"

AO2 Points (Language/Form/Structure):
${content.ao2Points || '(not provided)'}

AO3 Context:
${content.ao3Context || '(not provided)'}

AO5 Critics/Interpretations:
${content.ao5Critics || '(not provided)'}

Evaluate their planning:
1. Is the thesis clear, arguable, and addresses the question directly?
2. Do they have strong AO2 points (specific quotes with techniques)?
3. Is context relevant and specific (not generic)?
4. Are critics named with their specific arguments?
5. Is there enough material for a full essay?

Give specific feedback. Name quotes, techniques, critics they should add.
End with: "Ready to write ✅" or "Needs more work ⚠️"`,

      introduction: `${baseContext}

The student is writing their INTRODUCTION:

"${content}"

Evaluate:
1. Does it engage with the question immediately?
2. Is there a clear, arguable thesis?
3. Does it signpost the essay structure?
4. Is terminology used accurately?
5. Word count appropriate (80-120 words)?

Give specific feedback on what's working and what needs refinement.`,

      analysis1: `${baseContext}

The student is writing their FIRST ANALYSIS section (${textType === 'drama' ? 'Scene Analysis' : textType === 'prose' ? 'Close Reading' : 'Poem 1'}):

"${content}"

Evaluate:
1. Is there close textual analysis with embedded quotes?
2. Are techniques identified AND their effects explained?
3. Is analysis linked back to the thesis?
4. Is terminology used accurately (AO1)?
5. Word count appropriate?

Be specific - which quotes work well? What techniques are missed?`,

      analysis2: `${baseContext}

Previous sections:
- Introduction: "${essayContent.introduction.substring(0, 200)}..."
- First analysis: "${essayContent.analysis1.substring(0, 200)}..."

The student is writing their SECOND ANALYSIS section (${textType === 'drama' ? 'Character & Performance' : textType === 'prose' ? 'Narrative Technique' : 'Poem 2'}):

"${content}"

Evaluate:
1. Does it develop new points (not repeat)?
2. Is there close textual analysis with embedded quotes?
3. ${textType === 'poetry' ? 'Are comparison threads woven in?' : 'Does it build on the previous section?'}
4. Are techniques and effects explained?
5. Word count appropriate?

Give specific feedback on development and analysis quality.`,

      analysis3: `${baseContext}

The student is writing their THIRD ANALYSIS section (Context & Critics / Synthesis):

"${content}"

Evaluate:
1. Is context specific and illuminating (not generic)?
2. Are critics named with their specific arguments?
3. Does the student engage with critics (agree/challenge/complicate)?
4. Is this integrated with textual analysis, not bolted on?
5. Word count appropriate?

Be specific about which contextual/critical points work and what's missing.`,

      conclusion: `${baseContext}

The student is writing their CONCLUSION:

"${content}"

Evaluate:
1. Is there a clear verdict answering the question?
2. Does it synthesise (not just summarise)?
3. Does it leave a lasting impression?
4. Is it appropriately concise (80-120 words)?

Give specific feedback on conclusion effectiveness.`,

      review: `${baseContext}

The student has completed their full essay. Here it is:

Introduction:
"${essayContent.introduction}"

${textType === 'drama' ? 'Scene Analysis' : textType === 'prose' ? 'Close Reading' : 'Poem 1 Analysis'}:
"${essayContent.analysis1}"

${textType === 'drama' ? 'Character & Performance' : textType === 'prose' ? 'Narrative Technique' : 'Poem 2 Analysis'}:
"${essayContent.analysis2}"

${textType === 'drama' ? 'Context & Critics' : textType === 'prose' ? 'Context & Critics' : 'Synthesis & Context'}:
"${essayContent.analysis3}"

Conclusion:
"${essayContent.conclusion}"

Total word count: ${getTotalWordCount()}

Provide a FINAL ASSESSMENT using Edexcel criteria:

AO1 (Articulate response, terminology):
- Quality of written expression?
- Accurate use of literary terminology?

AO2 (Language, form, structure):
- Close textual analysis present?
- Techniques identified with effects?
- This is the most important AO - assess carefully

AO3 (Context):
- Relevant contextual understanding?
- Context illuminates the text?

${textType === 'poetry' ? 'AO4 (Connections):' : 'AO5 (Interpretations):'}
- ${textType === 'poetry' ? 'Effective comparison throughout?' : 'Critics used effectively?'}
- ${textType === 'poetry' ? 'Balance between poems?' : 'Personal response alongside critics?'}

Overall:
- Estimated mark: X/${textType === 'poetry' ? '30' : '35'}
- What would push it to the next band?
- Top 3 specific improvements

Be specific and constructive. Celebrate what works!`
    };

    return stagePrompts[stage] || baseContext;
  };

  // Fetch feedback
  const getFeedback = async () => {
    const stage = currentStageData.id;
    const content = getCurrentContent();

    if (stage === 'planning') {
      if (!content.thesis && !content.ao2Points) {
        setFeedback({ type: 'info', message: 'Start by writing your thesis and AO2 points above!' });
        return;
      }
    } else if (stage !== 'review' && (!content || getWordCount(content) < 10)) {
      setFeedback({ type: 'info', message: 'Write a bit more before getting feedback!' });
      return;
    }

    setFeedbackLoading(true);
    setFeedback(null);

    try {
      const prompt = getStagePrompt(stage, content);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini'
        })
      });

      if (!response.ok) throw new Error('Failed to get feedback');

      const data = await response.json();
      const rawFeedback = data.choices?.[0]?.message?.content || 'No feedback available';
      const feedbackText = stripMarkdown(rawFeedback);

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

  // Help Me Out
  const getHelp = async () => {
    const stage = currentStageData.id;
    setHelpLoading(true);
    setHelpContent(null);
    setShowHelpModal(true);

    const helpPrompts = {
      planning: `You are helping an A-Level student plan an Edexcel English Literature essay on ${getTextTypeLabel()}.

Question: "${questionText}"

Give them SPECIFIC, CONCRETE suggestions:

1. Suggested Thesis (1-2 sentences they could adapt)

2. Key AO2 Points (3 quotes with techniques):
   - Quote: "[...]" → Technique: [e.g., metaphor] → Effect: [...]
   - Quote: "[...]" → Technique: [...] → Effect: [...]
   - Quote: "[...]" → Technique: [...] → Effect: [...]

3. Relevant Context (AO3):
   - [Specific contextual point and how it illuminates the text]

4. Critics to Use (AO5):
   - [Critic name]: [Their specific argument about this text]
   - [Critic name]: [Their specific argument]

Be specific with page/act references where possible.`,

      introduction: `You are helping an A-Level student write their introduction for an Edexcel English Literature essay.

Question: "${questionText}"
Text type: ${getTextTypeLabel()}

Give them a MODEL INTRODUCTION (80-100 words):

[Write a strong introduction that engages with the question, states a clear thesis, and signposts the argument]

Then explain briefly WHY this introduction works for Edexcel criteria.`,

      analysis1: `You are helping an A-Level student write close textual analysis for Edexcel English Literature.

Question: "${questionText}"
Text type: ${getTextTypeLabel()}

Give them a MODEL PARAGRAPH (200-250 words) showing:
- Embedded quotes with technique identification
- Effect analysis (what the technique DOES)
- Link back to thesis/question

Then list KEY QUOTES they should consider using with their techniques.`,

      analysis2: `You are helping write ${textType === 'poetry' ? 'analysis of the second poem with comparison' : 'the second analytical section'}.

Question: "${questionText}"

Give them a MODEL PARAGRAPH showing:
- ${textType === 'poetry' ? 'Analysis of poem 2 with comparison threads to poem 1' : 'Development of argument with new evidence'}
- Embedded quotes with technique + effect
- ${textType === 'drama' ? 'Performance/staging considerations' : textType === 'prose' ? 'Narrative technique analysis' : 'Comparison woven throughout'}

Then suggest KEY POINTS to cover.`,

      analysis3: `You are helping integrate context and critics into an English Literature essay.

Question: "${questionText}"
Text type: ${getTextTypeLabel()}

Give them a MODEL PARAGRAPH showing:
- Specific contextual point that illuminates the text
- A named critic with their argument
- How to engage with the critic (agree/challenge/complicate)
- Integration with textual analysis

Then list CRITICS and CONTEXTS they should consider.`,

      conclusion: `You are helping write a conclusion for an Edexcel English Literature essay.

Question: "${questionText}"

Give them a MODEL CONCLUSION (80-100 words):

[Write a strong conclusion that synthesises the argument and delivers a clear verdict]

Then explain what makes an effective Literature conclusion.`
    };

    try {
      const prompt = helpPrompts[stage] || 'Help is not available for this stage.';
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini'
        })
      });

      if (!response.ok) throw new Error('Failed to get help');

      const data = await response.json();
      const rawHelp = data.choices?.[0]?.message?.content || 'No help available';
      setHelpContent(stripMarkdown(rawHelp));

    } catch (error) {
      console.error('Help error:', error);
      setHelpContent('Sorry, could not load help. Please try again.');
    } finally {
      setHelpLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Navigation
  const goToStage = (index) => {
    if (index >= 0 && index < stages.length) {
      setCurrentStageIndex(index);
      setFeedback(null);
    }
  };

  // Render text type selection
  if (!textType) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600 mb-3">
              ✍️ English Literature Essay Co-Pilot
            </h1>
            <p className="text-gray-600 text-lg">Guided essay writing for Edexcel A-Level</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">What type of text are you writing about?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setTextType('drama')}
                className="p-6 bg-white rounded-2xl border-2 border-rose-200 hover:border-rose-400 hover:shadow-lg transition-all group"
              >
                <Theater className="w-12 h-12 text-rose-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Drama</h3>
                <p className="text-gray-600 text-sm">Hamlet, Waiting for Godot, etc.</p>
                <p className="text-rose-600 text-xs mt-2">Stagecraft • Performance • Dialogue</p>
              </button>

              <button
                onClick={() => setTextType('prose')}
                className="p-6 bg-white rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all group"
              >
                <BookOpen className="w-12 h-12 text-amber-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Prose</h3>
                <p className="text-gray-600 text-sm">Heart of Darkness, The Lonely Londoners, etc.</p>
                <p className="text-amber-600 text-xs mt-2">Narrative • Imagery • Symbolism</p>
              </button>

              <button
                onClick={() => setTextType('poetry')}
                className="p-6 bg-white rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all group"
              >
                <Feather className="w-12 h-12 text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Poetry</h3>
                <p className="text-gray-600 text-sm">Anthology comparison essays</p>
                <p className="text-purple-600 text-xs mt-2">Form • Meter • Comparison</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render question selection
  if (!started) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <button onClick={() => setTextType(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="w-5 h-5" /> Back to text type
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              {textType === 'drama' && <Theater className="w-5 h-5 text-rose-500" />}
              {textType === 'prose' && <BookOpen className="w-5 h-5 text-amber-500" />}
              {textType === 'poetry' && <Feather className="w-5 h-5 text-purple-500" />}
              <span className="font-medium text-gray-700">{getTextTypeLabel()}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Question</h1>
            <p className="text-gray-600">Select a sample question or write your own</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Sample Questions:</h3>
            <div className="space-y-2">
              {sampleQuestions[textType].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestionText(q)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    questionText === q
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Or write your own:</h3>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your essay question here..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none"
              rows={3}
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => questionText.trim() && setStarted(true)}
              disabled={!questionText.trim()}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                questionText.trim()
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-amber-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Start Writing →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main essay writing interface
  const typeColors = {
    drama: { primary: 'rose', gradient: 'from-rose-500 to-red-500' },
    prose: { primary: 'amber', gradient: 'from-amber-500 to-orange-500' },
    poetry: { primary: 'purple', gradient: 'from-purple-500 to-indigo-500' }
  };
  const colors = typeColors[textType];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 hover:bg-white/20 px-3 py-1 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" /> Exit
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">English Literature Essay Co-Pilot</h1>
            <p className="text-white/80 text-sm">{getTextTypeLabel()} • {questionText.substring(0, 50)}...</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{getTotalWordCount()} words</div>
            <div className="text-white/70">Target: ~1000</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {stages.map((stage, index) => (
            <button
              key={stage.id}
              onClick={() => goToStage(index)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                index === currentStageIndex
                  ? `bg-${colors.primary}-100 text-${colors.primary}-700 ring-2 ring-${colors.primary}-300`
                  : index < currentStageIndex
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {index < currentStageIndex ? '✓' : index + 1}. {stage.title.replace(/^[^\s]+\s/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left panel - Writing area */}
        <div className="w-1/2 border-r flex flex-col bg-white">
          <div className={`p-4 bg-gradient-to-r ${colors.gradient} text-white`}>
            <h2 className="font-bold text-lg">{currentStageData.title}</h2>
            <p className="text-white/80 text-sm">{currentStageData.description}</p>
            {currentStageData.targetWords !== 'N/A' && (
              <p className="text-white/60 text-xs mt-1">Target: {currentStageData.targetWords}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentStageData.id === 'planning' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Thesis</label>
                  <textarea
                    value={essayContent.planning.thesis}
                    onChange={(e) => setEssayContent(prev => ({
                      ...prev,
                      planning: { ...prev.planning, thesis: e.target.value }
                    }))}
                    placeholder="What is your main argument? e.g., 'Shakespeare presents grief as both paralysing and transformative...'"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AO2: Language/Form/Structure Points</label>
                  <textarea
                    value={essayContent.planning.ao2Points}
                    onChange={(e) => setEssayContent(prev => ({
                      ...prev,
                      planning: { ...prev.planning, ao2Points: e.target.value }
                    }))}
                    placeholder="Key quotes with techniques:
• 'quote' - technique (e.g., metaphor) - effect
• 'quote' - technique - effect"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 resize-none"
                    rows={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AO3: Context</label>
                  <textarea
                    value={essayContent.planning.ao3Context}
                    onChange={(e) => setEssayContent(prev => ({
                      ...prev,
                      planning: { ...prev.planning, ao3Context: e.target.value }
                    }))}
                    placeholder="Relevant historical, cultural, or literary context..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AO5: Critics & Interpretations</label>
                  <textarea
                    value={essayContent.planning.ao5Critics}
                    onChange={(e) => setEssayContent(prev => ({
                      ...prev,
                      planning: { ...prev.planning, ao5Critics: e.target.value }
                    }))}
                    placeholder="Critics to reference:
• Bradley argues that...
• Wilson Knight suggests..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            ) : currentStageData.id === 'review' ? (
              <div className="space-y-4">
                <div className="bg-rose-50 rounded-lg p-4">
                  <h3 className="font-semibold text-rose-800 mb-2">Introduction</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{essayContent.introduction || '(not written)'}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    {textType === 'drama' ? 'Scene Analysis' : textType === 'prose' ? 'Close Reading' : 'Poem 1'}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{essayContent.analysis1 || '(not written)'}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    {textType === 'drama' ? 'Character & Performance' : textType === 'prose' ? 'Narrative Technique' : 'Poem 2'}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{essayContent.analysis2 || '(not written)'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Context & Critics</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{essayContent.analysis3 || '(not written)'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Conclusion</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{essayContent.conclusion || '(not written)'}</p>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={essayContent[currentStageData.id] || ''}
                  onChange={(e) => setEssayContent(prev => ({
                    ...prev,
                    [currentStageData.id]: e.target.value
                  }))}
                  placeholder={`Write your ${currentStageData.title.replace(/^[^\s]+\s/, '').toLowerCase()} here...`}
                  className="w-full h-full min-h-[400px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 resize-none"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {getWordCount(essayContent[currentStageData.id] || '')} words
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 border-t bg-gray-50 flex justify-between">
            <button
              onClick={() => goToStage(currentStageIndex - 1)}
              disabled={currentStageIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => goToStage(currentStageIndex + 1)}
              disabled={currentStageIndex === stages.length - 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                currentStageIndex === stages.length - 1
                  ? 'opacity-50 cursor-not-allowed'
                  : `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-md`
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right panel - Feedback */}
        <div className="w-1/2 flex flex-col bg-amber-50/30">
          <div className="p-4 bg-amber-100 border-b">
            <h2 className="font-bold text-amber-800 flex items-center gap-2">
              🎓 Coach Feedback
            </h2>
            <p className="text-amber-700 text-sm">Get guidance on your {currentStageData.title.replace(/^[^\s]+\s/, '').toLowerCase()}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {feedback ? (
              <div className={`p-4 rounded-xl ${
                feedback.type === 'success' ? 'bg-white shadow-md' :
                feedback.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{feedback.message}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-12">
                <p className="text-4xl mb-4">📝</p>
                <p>Write something, then click "Get Feedback"</p>
                <p className="text-sm mt-2">Or click "Help Me Out" if you're stuck!</p>
              </div>
            )}
          </div>

          {/* Feedback buttons */}
          <div className="p-4 border-t bg-amber-100/50 space-y-2">
            <button
              onClick={getFeedback}
              disabled={feedbackLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                feedbackLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-lg`
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 flex justify-between items-center`}>
              <div>
                <h2 className="text-xl font-bold">🆘 Help Me Out</h2>
                <p className="text-white/80 text-sm">Suggestions for: {currentStageData.title}</p>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {helpLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${colors.primary}-600 mx-auto mb-4`}></div>
                    <p className={`text-${colors.primary}-700`}>Generating suggestions...</p>
                  </div>
                </div>
              ) : helpContent ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{helpContent}</div>
              ) : (
                <p className="text-gray-500">No help content available.</p>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => helpContent && copyToClipboard(helpContent)}
                disabled={!helpContent}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm bg-${colors.primary}-100 text-${colors.primary}-700 hover:bg-${colors.primary}-200 transition disabled:opacity-50`}
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
}

import React, { useState } from 'react';
import { Loader2, Clock, BookOpen, Target, CheckCircle, Play } from 'lucide-react';
import { useAIService } from '../hooks/useAIService';
import { buildAO1SummaryPrompt, buildAO3EvaluationPrompt, buildScenarioPrompt, buildMarkschemeCheckerPrompt } from '../prompts/index';

function StudySession({ topic, onBack }) {
  const [phase, setPhase] = useState('intro');
  const [userAnswer, setUserAnswer] = useState('');
  const [ao1Text, setAo1Text] = useState('');
  const [ao3Text, setAo3Text] = useState('');
  const [scenario, setScenario] = useState(null);
  const [scenarioAnswer, setScenarioAnswer] = useState('');
  const [marking, setMarking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ao1Feedback, setAo1Feedback] = useState(null);
  const { callAIWithPublicSources } = useAIService();

  // Convert markdown bold to HTML bold
  const formatBold = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Add spacing between bullet points
  const formatBullets = (text) => {
    return text.replace(/•/g, '\n•').replace(/\n\n•/g, '\n•');
  };

  // Format PEEL structure with better spacing and bold headers
  const formatPEEL = (text) => {
    return text
      // Handle the actual format being returned
      .replace(/- Point:/g, '\n\n**Point:**')
      .replace(/- Evidence:/g, '\n    **Evidence:**')
      .replace(/- Explain:/g, '\n    **Explain:**')
      .replace(/- Link:/g, '\n    **Link:**')
      // Also handle variations
      .replace(/Point:/g, '**Point:**')
      .replace(/Evidence:/g, '    **Evidence:**')
      .replace(/Explain:/g, '    **Explain:**')
      .replace(/Link:/g, '    **Link:**')
      // Clean up extra spacing
      .replace(/\n\n\n/g, '\n\n')
      .replace(/\n\n\n/g, '\n\n');
  };

  const startSession = async () => {
    setPhase('ao1-prompt');
    setLoading(true);
    try {
      const p = buildAO1SummaryPrompt(topic.title, topic.subTopic.title);
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title, 'ChatGPT');
      setAo1Text(res);
    } finally {
      setLoading(false);
    }
  };

  const markUserRecall = async () => {
    setLoading(true);
    try {
      const feedbackPrompt = `You are an expert AQA Psychology teacher analyzing a student's recall attempt for AQA Psychology 7182.

TOPIC: ${topic.title}
SUB-TOPIC: ${topic.subTopic.title}

STUDENT'S RECALL:
"${userAnswer}"

Analyze this recall and provide specific feedback. You must return ONLY a valid JSON object with this exact structure:

{
  "successful": [
    "specific concept or study they mentioned correctly",
    "another specific point they got right",
    "third specific thing they recalled well"
  ],
  "missed": [
    "important concept they didn't mention",
    "key study or researcher they missed",
    "critical mechanism or process they omitted"
  ],
  "overall": "Brief encouraging comment about their effort and what to focus on next"
}

Rules:
- Each bullet point must be specific (not generic like "some content")
- Focus on actual concepts, studies, researchers, mechanisms from ${topic.subTopic.title}
- Keep each bullet under 15 words
- Be encouraging but honest about gaps
- Return ONLY the JSON, no other text`;

      console.log('[AO1 Marking] Sending prompt:', feedbackPrompt);
      const res = await callAIWithPublicSources(feedbackPrompt, topic.title, topic.subTopic.title, 'ChatGPT');
      console.log('[AO1 Marking] Raw AI response:', res);
      
      let feedback;
      try {
        // Try to extract JSON if wrapped in other text
        const jsonMatch = res.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : res;
        feedback = JSON.parse(jsonStr);
        console.log('[AO1 Marking] Parsed feedback:', feedback);
      } catch (parseError) {
        console.error('[AO1 Marking] Parse error:', parseError);
        console.error('[AO1 Marking] Failed to parse:', res);
        
        // Create more intelligent fallback based on user input
        const userInputLower = userAnswer.toLowerCase();
        if (userInputLower.includes('nothing') || userInputLower.includes('know') || userInputLower.length < 10) {
          feedback = {
            successful: [],
            missed: [
              `Key concepts and definitions in ${topic.subTopic.title}`,
              `Important studies and researchers (e.g., specific names and years)`,
              `Mechanisms and processes specific to ${topic.subTopic.title}`,
              `How ${topic.subTopic.title} relates to ${topic.title}`
            ],
            overall: `It's okay to start from scratch! Focus on learning the basic concepts, key studies, and how they connect to ${topic.subTopic.title}.`
          };
        } else {
          feedback = {
            successful: [`You recalled some aspects of ${topic.subTopic.title}`],
            missed: [
              `Key studies and researchers in ${topic.subTopic.title}`,
              `Specific mechanisms and processes`,
              `Important definitions and concepts`
            ],
            overall: `Good effort! Focus on learning the specific studies, researchers, and mechanisms for ${topic.subTopic.title}.`
          };
        }
      }
      
      // Validate feedback structure
      if (!feedback.successful || !feedback.missed || !feedback.overall) {
        throw new Error('Invalid feedback structure');
      }
      
      setAo1Feedback(feedback);
      setPhase('ao1-feedback');
    } catch (e) {
      console.error('[AO1 Marking] Error:', e);
      // Final fallback based on user input
      const userInputLower = userAnswer.toLowerCase();
      if (userInputLower.includes('nothing') || userInputLower.includes('know') || userInputLower.length < 10) {
        setAo1Feedback({
          successful: [],
          missed: [
            `Key concepts and definitions in ${topic.subTopic.title}`,
            `Important studies and researchers (e.g., specific names and years)`,
            `Mechanisms and processes specific to ${topic.subTopic.title}`,
            `How ${topic.subTopic.title} relates to ${topic.title}`
          ],
          overall: `It's okay to start from scratch! Focus on learning the basic concepts, key studies, and how they connect to ${topic.subTopic.title}.`
        });
      } else {
        setAo1Feedback({
          successful: [`You recalled some aspects of ${topic.subTopic.title}`],
          missed: [
            `Key studies and researchers in ${topic.subTopic.title}`,
            `Specific mechanisms and processes`,
            `Important definitions and concepts`
          ],
          overall: `Good effort! Focus on learning the specific studies, researchers, and mechanisms for ${topic.subTopic.title}.`
        });
      }
      setPhase('ao1-feedback');
    } finally {
      setLoading(false);
    }
  };

  const revealAO1 = () => setPhase('ao1-reveal');

  const generateAO3 = async () => {
    // Transition immediately so the user sees progress
    setPhase('scenario');
    setLoading(true);
    setAo3Text('');
    try {
      const p = buildAO3EvaluationPrompt(topic.title, topic.subTopic.title);
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title, 'ChatGPT');
      setAo3Text(res);
    } catch (e) {
      setAo3Text('Sorry, failed to load AO3 evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateScenario = async () => {
    // Transition immediately so the user sees progress
    setPhase('scenario-answer');
    setLoading(true);
    setScenario({ scenario: 'Preparing scenario…', model: '' });
    try {
      const p = buildScenarioPrompt(topic.title, topic.subTopic.title);
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title, 'ChatGPT');
      const scen = {
        scenario: res.split('Answer:')[0]?.replace('Scenario:', '').trim() || res,
        model: res.includes('Answer:') ? res.split('Answer:')[1].trim() : ''
      };
      setScenario(scen);
    } catch (e) {
      setScenario({ scenario: 'Sorry, failed to load scenario.', model: '' });
    } finally {
      setLoading(false);
    }
  };

  const markScenario = async () => {
    setLoading(true);
    try {
      const p = buildMarkschemeCheckerPrompt('Apply the topic scenario', userAnswer || scenarioAnswer);
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title, 'ChatGPT');
      let json;
      try { json = JSON.parse(res); } catch { json = { mark: null, improvements: [res.slice(0, 300)] }; }
      setMarking(json);
      setPhase('finish');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={onBack} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Study Session</h2>
            <p className="text-gray-600">{topic.title} — {topic.subTopic.title}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-blue-50 rounded border border-blue-200 flex items-center gap-2"><BookOpen className="w-4 h-4"/> AO1 recall</div>
              <div className="p-3 bg-purple-50 rounded border border-purple-200 flex items-center gap-2"><Target className="w-4 h-4"/> AO3 PEEL</div>
              <div className="p-3 bg-green-50 rounded border border-green-200 flex items-center gap-2"><Clock className="w-4 h-4"/> Scenario + quick mark</div>
            </div>
            <button onClick={startSession} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">
              <Play className="w-4 h-4 inline mr-2"/> Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'ao1-prompt') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={onBack} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Active Recall</h3>
              <p className="text-sm text-gray-600">{topic.title} — {topic.subTopic.title}</p>
            </div>
            <p className="text-sm text-gray-700">
              Without looking at notes, write everything you can recall about <strong>{topic.subTopic.title}</strong>.
            </p>
            <textarea value={userAnswer} onChange={(e)=>setUserAnswer(e.target.value)} rows={6} className="w-full border rounded p-3" placeholder={`Type what you remember about ${topic.subTopic.title}...`}/>
            <div className="flex items-center justify-between">
              <button onClick={markUserRecall} disabled={!userAnswer.trim() || loading} className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50">Mark My Recall</button>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  Analyzing your recall…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'ao1-feedback') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={() => setPhase('ao1-prompt')} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold">Your Recall Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">✅ You Successfully Recalled:</h4>
                <ul className="space-y-1">
                  {ao1Feedback?.successful?.map((point, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">❌ You Missed:</h4>
                <ul className="space-y-1">
                  {ao1Feedback?.missed?.map((point, i) => (
                    <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {ao1Feedback?.overall && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{ao1Feedback.overall}</p>
              </div>
            )}
            
            <button onClick={revealAO1} className="px-4 py-2 bg-blue-600 text-white rounded">See Full AO1 Summary</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'ao1-reveal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={() => setPhase('ao1-prompt')} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold">AO1 Summary</h3>
            <div 
              className="font-sans whitespace-pre-wrap text-base text-gray-800 bg-blue-50 border border-blue-200 p-3 rounded"
              dangerouslySetInnerHTML={{ __html: formatBold(formatBullets(ao1Text || (loading ? 'Loading…' : 'No summary available.'))) }}
            />
            <button onClick={generateAO3} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>Next: AO3 PEEL</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'scenario') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={() => setPhase('ao1-reveal')} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold">AO3 Evaluation (PEEL x5)</h3>
            <div 
              className="font-sans whitespace-pre-wrap text-base text-gray-800 bg-purple-50 border border-purple-200 p-3 rounded"
              dangerouslySetInnerHTML={{ __html: formatBold(formatPEEL(ao3Text || (loading ? 'Loading…' : 'No AO3 content yet.'))) }}
            />
            <button onClick={generateScenario} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>Next: Scenario</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'scenario-answer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={() => setPhase('scenario')} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold">Apply to Scenario</h3>
            <div className="text-sm bg-green-50 border border-green-200 p-3 rounded"><strong>Scenario:</strong> {scenario?.scenario}</div>
            <textarea value={scenarioAnswer} onChange={(e)=>setScenarioAnswer(e.target.value)} rows={6} className="w-full border rounded p-3" placeholder="Write your applied answer..."/>
            <button onClick={markScenario} disabled={!scenarioAnswer.trim() || loading} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Quick Mark</button>
            {loading && <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="w-4 h-4 animate-spin"/>Preparing…</div>}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'finish') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={() => setPhase('scenario-answer')} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4 text-center">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto"/>
            <h3 className="font-semibold">Session Complete</h3>
            {marking && (
              <div className="text-sm bg-gray-50 border p-3 rounded">
                <div>Mark: {marking.mark ?? '—'}/{marking.max ?? 16} {marking.band ? `(${marking.band})` : ''}</div>
                {Array.isArray(marking.improvements) && (
                  <ul className="list-disc ml-5 mt-2 text-left">
                    {marking.improvements.map((it,i)=>(<li key={i}>{it}</li>))}
                  </ul>
                )}
              </div>
            )}
            <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded">Back to Topic</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default StudySession; 
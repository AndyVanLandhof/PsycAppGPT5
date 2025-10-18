import React, { useState } from 'react';
import { Loader2, Clock, BookOpen, Target, CheckCircle, Play } from 'lucide-react';
import { getSelectedCurriculum } from '../config/curricula';
import { useAIService } from '../hooks/useAIService';
import { buildAO1SummaryPrompt, buildAO3EvaluationPrompt, buildScenarioPrompt, buildMarkschemeCheckerPrompt } from '../prompts/index';
import { KUsBySubTopic } from '../data/knowledgeMaps';

function StudySession({ topic, onBack }) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const [phase, setPhase] = useState('intro');
  const [userAnswer, setUserAnswer] = useState('');
  const [ao1Text, setAo1Text] = useState('');
  const [ao3Text, setAo3Text] = useState('');
  const [scenario, setScenario] = useState(null);
  const [scenarioAnswer, setScenarioAnswer] = useState('');
  const [marking, setMarking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ao1Feedback, setAo1Feedback] = useState(null);
  const [flowMode, setFlowMode] = useState(() => {
    try { return localStorage.getItem('session-flow-mode') || 'guided'; } catch(_) { return 'guided'; }
  });
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
    // Enter AO1 recall phase; prefetch AO1 summary in the background
    setPhase('ao1-prompt');
    try {
      const p = buildAO1SummaryPrompt(topic.title, topic.subTopic.title);
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title);
      setAo1Text(res);
    } catch (_) {}
  };

  const markUserRecall = async () => {
    setLoading(true);
    try {
      // --- KU-based scoring additions ---
      const subTopicId = topic.subTopic?.id || String(topic.subTopic.title || '').toLowerCase().replace(/\s+/g, '-');
      const compositeKey = `${topic.id}:${subTopicId}`;
      const kus = Array.isArray(KUsBySubTopic[compositeKey])
        ? KUsBySubTopic[compositeKey]
        : (Array.isArray(KUsBySubTopic[subTopicId]) ? KUsBySubTopic[subTopicId] : []);

      // Helpers (scoped here to avoid cross-file churn)
      const clamp01 = (x) => Math.max(0, Math.min(1, x));
      const computeAR = (units, kuList, errorPenaltyCount = 0) => {
        const weights = kuList.reduce((s, k) => s + (k.weight || 1), 0);
        const weighted = units.reduce((s, u) => {
          const k = kuList.find((x) => x.id === u.id);
          return k ? s + (k.weight || 1) * (Number(u.score) || 0) : s;
        }, 0);
        const base = weights ? weighted / weights : 0;
        const penalty = Math.min(0.15, errorPenaltyCount * 0.05);
        return clamp01(base - penalty);
      };
      const safeParseJSON = (raw) => {
        const first = raw.indexOf('{');
        const last = raw.lastIndexOf('}');
        if (first === -1 || last === -1 || last < first) throw new Error('No JSON braces found');
        const slice = raw.slice(first, last + 1);
        return JSON.parse(slice);
      };
      const keywordFallbackScorer = (answer, kuList) => {
        const a = String(answer || '').toLowerCase();
        return kuList.map((k) => {
          const hits = (k.mustInclude || []).some((t) => a.includes(String(t).toLowerCase()));
          const near = (k.accept || []).some((t) => a.includes(String(t).toLowerCase()));
          const score = hits ? 1 : near ? 0.5 : 0;
          let evidence = '';
          if (score > 0) {
            const token = String((k.mustInclude && k.mustInclude[0]) || (k.accept && k.accept[0]) || '').toLowerCase();
            const idx = a.indexOf(token);
            if (idx >= 0) evidence = String(answer || '').substring(Math.max(0, idx - 30), Math.min(String(answer || '').length, idx + token.length + 30));
          }
          return { id: k.id, score, evidence };
        });
      };
      const toUI = (units, kuList) => {
        const byId = Object.fromEntries(kuList.map((k) => [k.id, k]));
        const successful = units.filter((u) => Number(u.score) === 1).slice(0, 3).map((u) => byId[u.id]?.label || u.id);
        const missed = units.filter((u) => Number(u.score) === 0).slice(0, 3).map((u) => byId[u.id]?.label || u.id);
        return { successful, missed };
      };
      const srsGradeFor = (u) => (Number(u.score) === 1 ? 'Good' : Number(u.score) === 0.5 ? 'Hard' : 'Again');
      const microPrompts = (units, kuList) => {
        const byId = Object.fromEntries(kuList.map((k) => [k.id, k]));
        const targets = (units || []).filter((u) => Number(u.score) === 0 || Number(u.score) === 0.5);
        return targets.map((u) => {
          const k = byId[u.id];
          const base = (k && (k.cue || k.label)) || u.id;
          return `In one or two sentences, recall: ${base}`;
        });
      };

      // Build strict JSON prompt only if we have a KU map; otherwise fall back to current behavior
      let feedback;
      if (kus.length > 0) {
        const schema = `\nReturn ONLY valid JSON with this exact shape:\n{\n  "subTopicId": "${subTopicId}",\n  "units": [\n    { "id": "<one of the provided KU ids>", "score": 1 | 0.5 | 0, "evidence": "<exact quote from student or ''>" }\n  ],\n  "errors": [\n    { "text": "<concise factual error in student's answer>", "correction": "<brief correction>" }\n  ],\n  "ar": 0.0\n}\nRules:\n- Score ONLY the KU ids provided below; never invent new ids.\n- Score 1 for full, 0.5 for partial, 0 for miss.\n- Always include evidence for 1 or 0.5 from the student's text; empty string if 0.\n- Keep errors to max 3 items; omit if none.\n- Output JSON only, no prose.`;

        const feedbackPrompt = `\nYou are an examiner. Use the provided KU list to score the student's **Active Recall** answer.\nKUs (JSON):\n${JSON.stringify(kus, null, 2)}\n\nStudent's answer (triple backticks):\n\`\`\`\n${userAnswer}\n\`\`\`\n\n${schema}\n`.trim();

        console.log('[AO1 Marking] Sending prompt (KU-based):', feedbackPrompt);
        const res = await callAIWithPublicSources(feedbackPrompt, topic.title, topic.subTopic.title);
        console.log('[AO1 Marking] Raw AI response:', res);

        let parsed = null;
        try {
          parsed = safeParseJSON(res);
        } catch (e) {
          console.warn('[AO1 Marking] JSON parse failed, using fallback scorer.', e);
          const fbUnits = keywordFallbackScorer(userAnswer, kus);
          parsed = { subTopicId, units: fbUnits, errors: [], ar: computeAR(fbUnits, kus, 0) };
        }
        // Ensure every KU is represented; default missing ones to score 0
        const incoming = Array.isArray(parsed?.units) ? parsed.units : [];
        const byIdIncoming = new Map(incoming.map(u => [u.id, u]));
        const allUnits = kus.map(k => {
          const u = byIdIncoming.get(k.id);
          return u ? { id: k.id, score: Number(u.score) || 0, evidence: String(u.evidence || '') } : { id: k.id, score: 0, evidence: '' };
        });
        const ar = computeAR(allUnits, kus, Array.isArray(parsed?.errors) ? parsed.errors.length : 0);
        const { successful, missed } = toUI(allUnits, kus);
        const overall = ar >= 0.85 ? 'Excellent recall. Extend with applications and critiques next.' : ar >= 0.7 ? 'Solid base. Shore up the highlighted gaps, then push to application.' : 'Early stage. Focus the micro-prompts below, then re-try in a day.';
        const srsSignals = allUnits.map((u) => ({ subTopicId, kuId: u.id, grade: srsGradeFor(u) }));
        feedback = { successful, missed, overall, _ar: ar, _units: allUnits, _srsSignals: srsSignals, _microPrompts: microPrompts(allUnits, kus) };
      } else {
        // Legacy prompt path if no KU map available
        const legacyPrompt = `You are an expert AQA Psychology teacher analyzing a student's recall attempt for AQA Psychology 7182.\n\nTOPIC: ${topic.title}\nSUB-TOPIC: ${topic.subTopic.title}\n\nSTUDENT'S RECALL:\n"${userAnswer}"\n\nAnalyze this recall and provide specific feedback. You must return ONLY a valid JSON object with this exact structure:\n\n{\n  "successful": [\n    "specific concept or study they mentioned correctly",\n    "another specific point they got right",\n    "third specific thing they recalled well"\n  ],\n  "missed": [\n    "important concept they didn't mention",\n    "key study or researcher they missed",\n    "critical mechanism or process they omitted"\n  ],\n  "overall": "Brief encouraging comment about their effort and what to focus on next"\n}\n\nRules:\n- Each bullet point must be specific (not generic like "some content")\n- Focus on actual concepts, studies, researchers, mechanisms from ${topic.subTopic.title}\n- Keep each bullet under 15 words\n- Be encouraging but honest about gaps\n- Return ONLY the JSON, no other text`;
        const res = await callAIWithPublicSources(legacyPrompt, topic.title, topic.subTopic.title);
        let parsed = null;
        try {
          const jsonMatch = res.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : res;
          parsed = JSON.parse(jsonStr);
        } catch (_) {
          parsed = null;
        }
        if (!parsed || !parsed.successful || !parsed.missed || !parsed.overall) throw new Error('Invalid feedback');
        feedback = parsed;
      }

      setAo1Feedback(feedback);
      try {
        // Persist per-KU SRS signals by upserting lightweight cards to the sub-topic deck
        if (Array.isArray(feedback?._srsSignals) && feedback?._units) {
          const subId = topic.subTopic.id;
          const key = `srs-cards-${subId}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const byId = new Map(existing.map(c => [c.id, c]));
          feedback._srsSignals.forEach(sig => {
            const unit = feedback._units.find(u => u.id === sig.kuId);
            const cardId = `ku-${sig.kuId}`;
            const baseCard = byId.get(cardId) || {
              id: cardId,
              question: (sig.kuId || '').replace(/-/g, ' '),
              answer: unit?.evidence || 'Review this KU.',
              repetitions: 0,
              easeFactor: 2.5,
              interval: 1,
              nextReview: new Date().toISOString(),
              lastReviewed: null
            };
            // Map Again/Hard/Good to immediate schedule intents
            let quality = sig.grade === 'Good' ? 5 : sig.grade === 'Hard' ? 3 : 1;
            // Lightweight schedule bump: store a synthetic history entry
            const reviewHistory = Array.isArray(baseCard.reviewHistory) ? baseCard.reviewHistory.slice(0) : [];
            reviewHistory.push({ date: new Date().toISOString(), quality });
            byId.set(cardId, { ...baseCard, reviewHistory });
          });
          const out = Array.from(byId.values());
          localStorage.setItem(key, JSON.stringify(out));
        }
      } catch (_) {}
      setPhase('ao1-feedback');
      // Guided flow: auto-progress AO1 -> AO1 summary -> AO2 scenario
      if (flowMode === 'guided') {
        setTimeout(() => {
          try { setPhase('ao1-reveal'); } catch(_) {}
          setTimeout(() => { try { generateScenario(); } catch(_) {} }, 400);
        }, 250);
      }
    } catch (e) {
      console.error('[AO1 Marking] Error:', e);
      const userInputLower = (userAnswer || '').toLowerCase();
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
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title);
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
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title);
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
      const res = await callAIWithPublicSources(p, topic.title, topic.subTopic.title);
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
            <div className="inline-flex items-center gap-2 bg-gray-50 border rounded px-3 py-2">
              <span className="text-sm text-gray-700 font-medium">Flow:</span>
              <button
                className={`text-sm px-3 py-1 rounded border ${flowMode==='guided' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => { setFlowMode('guided'); try { localStorage.setItem('session-flow-mode','guided'); } catch(_) {} }}
              >
                Guided
              </button>
              <button
                className={`text-sm px-3 py-1 rounded border ${flowMode==='free' ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => { setFlowMode('free'); try { localStorage.setItem('session-flow-mode','free'); } catch(_) {} }}
              >
                Free
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 text-base text-left">
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 text-lg font-semibold"><BookOpen className="w-5 h-5"/> AO1 recall</div>
                <p className="mt-2 text-sm md:text-base text-blue-800">Recall core terms, theories and studies accurately. Tests knowledge/understanding (AO1).</p>
              </div>
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2 text-lg font-semibold"><Clock className="w-5 h-5"/> Scenario (AO2) + quick mark</div>
                <p className="mt-2 text-sm md:text-base text-green-800">Apply concepts to a novel scenario and explain them in context. Tests application {curriculum==='ocr-rs' ? '(AO2 analysis/evaluation)' : '(AO2)'}.</p>
              </div>
              {curriculum !== 'ocr-rs' && (
                <div className="p-4 bg-purple-50 rounded border border-purple-200">
                  <div className="flex items-center gap-2 text-lg font-semibold"><Target className="w-5 h-5"/> AO3 PEEL</div>
                  <p className="mt-2 text-sm md:text-base text-purple-800"><span className="font-medium">PEEL</span>: Point • Evidence • Explain • Link. Tests analysis and evaluation (AO3).</p>
                </div>
              )}
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
                  {userAnswer.trim() ? 'Analyzing your recall…' : 'Preparing…'}
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
            
            {(() => {
              const subId = topic.subTopic.id;
              const comp = `${topic.id}:${subId}`;
              const kuList = Array.isArray(KUsBySubTopic[comp]) ? KUsBySubTopic[comp] : (Array.isArray(KUsBySubTopic[subId]) ? KUsBySubTopic[subId] : []);
              const labelById = new Map(kuList.map(k => [k.id, k.label]));
              const units = Array.isArray(ao1Feedback?._units) ? ao1Feedback._units : null;
              const full = units
                ? units.filter(u => Number(u.score) === 1).map(u => labelById.get(u.id) || u.id)
                : (ao1Feedback?.successful || []);
              const partial = units
                ? units.filter(u => Number(u.score) === 0.5).map(u => labelById.get(u.id) || u.id)
                : [];
              const zero = units
                ? units.filter(u => Number(u.score) === 0).map(u => labelById.get(u.id) || u.id)
                : (ao1Feedback?.missed || []);
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Successfully Recalled</h4>
                    <ul className="space-y-1">
                      {full.map((point, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                      {full.length === 0 && <li className="text-sm text-gray-500">—</li>}
                    </ul>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">🟡 Got Some</h4>
                    <ul className="space-y-1">
                      {partial.map((point, i) => (
                        <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                      {partial.length === 0 && <li className="text-sm text-gray-500">—</li>}
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">❌ Missed Completely</h4>
                    <ul className="space-y-1">
                      {zero.map((point, i) => (
                        <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                      {zero.length === 0 && <li className="text-sm text-gray-500">—</li>}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* AR score and evidence (transparent marking) */}
            {(typeof ao1Feedback?._ar === 'number' || Array.isArray(ao1Feedback?._units)) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Active Recall score (AR): </span>
                    {typeof ao1Feedback?._ar === 'number' ? `${Math.round(ao1Feedback._ar * 100)}%` : '—'}
                  </div>
                </div>
                {Array.isArray(ao1Feedback?._units) && ao1Feedback._units.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium">Show KU evidence</summary>
                    <div className="mt-2 space-y-1">
                      {ao1Feedback._units.map((u, i) => (
                        <div key={i} className="text-xs text-gray-700">
                          <span className="font-medium">{u.id}</span>: score {u.score} {u.evidence ? `— "${u.evidence}"` : ''}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Micro-prompts for missed/partial KUs */}
            {Array.isArray(ao1Feedback?._microPrompts) && ao1Feedback._microPrompts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Quick Practice Prompts</h4>
                <ul className="list-disc ml-5 space-y-1 text-sm text-blue-900">
                  {ao1Feedback._microPrompts.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            
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
            <button onClick={generateScenario} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>Next: Scenario</button>
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

  if (phase === 'scenario-answer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-6">
          <button onClick={() => setPhase('scenario')} className="text-blue-600 underline mb-4">← Back</button>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {curriculum !== 'ocr-rs' ? (
              <>
                <h3 className="font-semibold">AO3 Evaluation (PEEL x5)</h3>
                <div 
                  className="font-sans whitespace-pre-wrap text-base text-gray-800 bg-purple-50 border border-purple-200 p-3 rounded"
                  dangerouslySetInnerHTML={{ __html: formatBold(formatPEEL(ao3Text || (loading ? 'Loading…' : 'No AO3 content yet.'))) }}
                />
                <button onClick={generateAO3} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>Next: AO3 PEEL</button>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto"/>
                <h3 className="font-semibold mt-2">Scenario complete</h3>
                <button onClick={onBack} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">Back to Topic</button>
              </div>
            )}
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
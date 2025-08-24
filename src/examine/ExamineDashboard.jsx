import React, { useEffect, useMemo, useRef, useState } from 'react';
import useTopicProgress from '../progress/useTopicProgress.js';
import MCQRunner from './runners/MCQRunner.jsx';
import ShortRunner from './runners/ShortRunner.jsx';
import ScenarioRunner from './runners/ScenarioRunner.jsx';
import EssayRunner from './runners/EssayRunner.jsx';
import { useAIService } from '../hooks/useAIService.js';
import { getAqaStyleExamplesCached } from './aqaStyle.js';
import { getMCQSet, getShortSet, getScenarioSet } from '../mock/examData.js';

export default function ExamineDashboard({ topicId, topicTitle }) {
  const { topicState } = useTopicProgress(topicId);
  const [mode, setMode] = useState(null);
  const { callAIWithPublicSources } = useAIService();
  const prefetchRanRef = useRef(false);

  const stats = useMemo(() => {
    const r = topicState?.reinforce || {};
    const last = {
      mcq: r.quizAvgPct ?? null,
      short: r.quizAvgPct ?? null,
      scenario: r.quizAvgPct ?? null,
      essay: topicState?.exam?.timedEssayPct ?? null
    };
    const best = last; // Placeholder until we track history
    const attempts = {
      mcq: r.quizAttempts || 0,
      short: r.quizAttempts || 0,
      scenario: r.quizAttempts || 0,
      essay: topicState?.exam?.attempts || 0
    };
    return { last, best, attempts };
  }, [topicState]);

  // Prefetch MCQ, Short, Scenario in parallel with a longer timeout (10s)
  useEffect(() => {
    let cancelled = false;
    if (prefetchRanRef.current) return; // run once per topic
    prefetchRanRef.current = true;
    (async () => {
      try {
        // Immediate mocks to ensure instant open
        try {
          sessionStorage.setItem(`runner-mcq-${topicId}`, JSON.stringify({ qs: getMCQSet(topicId, 5), idx: 0, answers: {} }));
          sessionStorage.setItem(`runner-short-${topicId}`, JSON.stringify({ items: getShortSet(topicId, 6), answers: {} }));
          sessionStorage.setItem(`runner-scenario-${topicId}`, JSON.stringify({ items: getScenarioSet(topicId, 2), answers: {} }));
        } catch {}

        const style = await getAqaStyleExamplesCached();
        const cues = {
          mcq: (style.mcq || []).slice(0, 2).join('\n'),
          short: (style.short || []).slice(0, 2).join('\n'),
          scenario: (style.scenario || []).slice(0, 2).join('\n')
        };
        const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

        const fetchMcq = (async () => {
          const prompt = `Create 5 multiple-choice questions (MCQs) for AQA Psychology topic: ${topicTitle}.
Style cues (do not copy text, only phrasing format):\n${cues.mcq}
Return JSON ONLY: { questions: [ { question: string, options: string[4], correctIndex: 0-3 } ] }.`;
          const text = await Promise.race([callAIWithPublicSources(prompt, topicTitle, null, 'gpt-4o-mini'), timeout(10000)]);
          const parsed = safeParseJson(text);
          const got = Array.isArray(parsed?.questions) ? parsed.questions.slice(0,5) : [];
          if (!cancelled && got.length === 5) sessionStorage.setItem(`runner-mcq-${topicId}`, JSON.stringify({ qs: got, idx: 0, answers: {} }));
        })().catch(() => {});

        const fetchShort = (async () => {
          const prompt = `Create 6 short-answer questions (2–6 marks each) for AQA Psychology topic: ${topicTitle}.
Style cues (do not copy text, only phrasing format):\n${cues.short}
Return JSON ONLY as { items: [ { prompt: string, max: number } ] }.`;
          const text = await Promise.race([callAIWithPublicSources(prompt, topicTitle, null, 'gpt-4o-mini'), timeout(10000)]);
          const parsed = safeParseJson(text);
          const got = Array.isArray(parsed?.items) ? parsed.items.slice(0,6) : [];
          if (!cancelled && got.length) sessionStorage.setItem(`runner-short-${topicId}`, JSON.stringify({ items: got, answers: {} }));
        })().catch(() => {});

        const fetchScenario = (async () => {
          const prompt = `Create 2 scenario/application questions (6 marks each) for AQA Psychology topic: ${topicTitle}.
Style cues (do not copy text, only phrasing format):\n${cues.scenario}
Return JSON ONLY as { items: [ { prompt: string, max: number } ] }.`;
          const text = await Promise.race([callAIWithPublicSources(prompt, topicTitle, null, 'gpt-4o-mini'), timeout(10000)]);
          const parsed = safeParseJson(text);
          const got = Array.isArray(parsed?.items) ? parsed.items.slice(0,2) : [];
          if (!cancelled && got.length) sessionStorage.setItem(`runner-scenario-${topicId}`, JSON.stringify({ items: got, answers: {} }));
        })().catch(() => {});

        // fire all without awaiting to avoid blocking
        fetchMcq; fetchShort; fetchScenario;
      } catch {}
    })();
    return () => { cancelled = true; };
  // Intentionally omit callAIWithPublicSources to avoid re-runs due to function identity
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, topicTitle]);

  const Card = ({ label, metricKey, onOpen }) => (
    <div className="border rounded-lg p-4 bg-white">
      <div className="font-semibold">{label}</div>
      <div className="text-sm text-gray-600">Last: {fmt(stats.last[metricKey])} • Best: {fmt(stats.best[metricKey])}</div>
      <div className="text-sm text-gray-600">Attempts: ×{stats.attempts[metricKey] || 0}</div>
      <button className="mt-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={onOpen}>Open</button>
    </div>
  );

  return (
    <div className="space-y-4 exam-paper">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card label="MCQ Drill" metricKey="mcq" onOpen={() => setMode('mcq')} />
        <Card label="Short Answers" metricKey="short" onOpen={() => setMode('short')} />
        <Card label="Scenario / Application" metricKey="scenario" onOpen={() => setMode('scenario')} />
        <Card label="Essay (16)" metricKey="essay" onOpen={() => setMode('essay')} />
      </div>

      {mode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 exam-paper">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold">{topicTitle} — {labelFor(mode)}</div>
              <button className="text-gray-600 hover:text-gray-800" onClick={() => setMode(null)}>✕</button>
            </div>
            {mode === 'mcq' && <MCQRunner topicId={topicId} onClose={() => setMode(null)} />}
            {mode === 'short' && <ShortRunner topicId={topicId} topicTitle={topicTitle} onClose={() => setMode(null)} />}
            {mode === 'scenario' && <ScenarioRunner topicId={topicId} topicTitle={topicTitle} onClose={() => setMode(null)} />}
            {mode === 'essay' && <EssayRunner topicId={topicId} topicTitle={topicTitle} onClose={() => setMode(null)} />}
          </div>
        </div>
      )}
    </div>
  );

  function fmt(v) { return Number.isFinite(v) ? `${v}%` : '—'; }
  function labelFor(m) {
    return m === 'mcq' ? 'MCQ Drill' : m === 'short' ? 'Short Answers' : m === 'scenario' ? 'Scenario / Application' : 'Essay';
  }
}

function safeParseJson(text) {
  try { return JSON.parse(text); } catch (_) {}
  try { return JSON.parse(String(text).replace(/^```json\n?|```$/g, '').trim()); } catch (_) {}
  const m = String(text).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
}



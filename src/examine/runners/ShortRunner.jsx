import React, { useEffect, useState } from 'react';
import { getShortSet } from '../../mock/examData.js';
import { toPercent, gradeFromPercent } from '../../exam/score.js';
import useTopicProgress from '../../progress/useTopicProgress.js';
import { markShortAnswer } from '../markers/gptMarker.js';
import { useAIService } from '../../hooks/useAIService.js';

export default function ShortRunner({ topicId, topicTitle, onClose }) {
  const { actions } = useTopicProgress(topicId);
  const { callAIWithPublicSources } = useAIService();
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const key = `runner-short-${topicId}`;

  useEffect(() => {
    try { const rec = JSON.parse(sessionStorage.getItem(key)); if (rec && rec.items) { setItems(rec.items); setAnswers(rec.answers||{}); return; } } catch(_){}
    setItems(getShortSet(topicId, 6));
  }, [topicId]);

  useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify({ items, answers })); } catch(_){} }, [items, answers]);

  const submit = async () => {
    let raw = 0, max = 0; const perItem = []; const snippets = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const payload = { question: it.prompt, markscheme: it.markscheme || [], studentAnswer: answers[i] || '', maxMarks: it.max };
      try {
        const r = await markShortAnswer(topicTitle || topicId, payload, callAIWithPublicSources);
        const m = Math.max(0, Math.min(it.max, Number(r.raw)||0));
        raw += m; max += it.max; perItem.push(m); snippets.push(r.rationale || '');
      } catch(_){ const m = Math.min(it.max, Math.round(((answers[i]||'').split(/\s+/).length/25) * it.max)); raw+=m; max+=it.max; perItem.push(m); snippets.push(''); }
    }
    const percent = toPercent(raw, max);
    actions.recordQuizResult(percent);
    setResult({ raw, max, percent, grade: gradeFromPercent(percent), perItem, snippets });
  };

  if (!items.length) return <div>Loading…</div>;
  if (result) return (
    <div className="space-y-3">
      <div className="font-semibold">Short Answers Results</div>
      <div className="text-xs text-gray-600">Source: <span className="px-2 py-0.5 rounded bg-gray-100">{isAiCached('short', topicId) ? 'AI' : 'Mock'}</span></div>
      <div className="text-sm text-gray-700">Score: {result.raw}/{result.max} ({result.percent}%) — Grade {result.grade}</div>
      <ul className="list-disc ml-5 text-sm text-gray-700">
        {result.snippets.filter(Boolean).slice(0,3).map((s,i)=>(<li key={i}>{s}</li>))}
      </ul>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => { sessionStorage.removeItem(key); setItems(getShortSet(topicId,6)); setAnswers({}); setResult(null); }}>Try Again</button>
        <button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="space-y-2">
          <div className="text-sm font-medium">Q{i+1}. {it.prompt} <span className="text-gray-500">(max {it.max})</span></div>
          <textarea rows="3" className="w-full border rounded p-2" value={answers[i]||''} onChange={(e)=> setAnswers({ ...answers, [i]: e.target.value })} />
        </div>
      ))}
      <div className="flex justify-end">
        <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}

function isAiCached(kind, topicId) {
  try {
    const key = kind === 'mcq' ? `runner-mcq-${topicId}` : kind === 'short' ? `runner-short-${topicId}` : `runner-scenario-${topicId}`;
    const rec = JSON.parse(sessionStorage.getItem(key));
    return !!rec && !!Object.keys(rec).length && !rec.mock;
  } catch { return false; }
}



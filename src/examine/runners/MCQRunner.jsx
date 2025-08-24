import React, { useEffect, useState } from 'react';
import { getMCQSet } from '../../mock/examData.js';
import { scoreMCQ, gradeFromPercent } from '../../exam/score.js';
import useTopicProgress from '../../progress/useTopicProgress.js';
import { getTopicConfig } from '../config.js';

export default function MCQRunner({ topicId, onClose }) {
  const { actions } = useTopicProgress(topicId);
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const config = getTopicConfig(topicId);
  const key = `runner-mcq-${topicId}`;

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      try {
        const rec = JSON.parse(saved);
        setQs(rec.qs || []);
        setIdx(rec.idx || 0);
        setAnswers(rec.answers || {});
        return;
      } catch {}
    }
    setQs(getMCQSet(topicId, 5));
  }, [topicId]);

  useEffect(() => {
    try { sessionStorage.setItem(key, JSON.stringify({ qs, idx, answers })); } catch {}
  }, [qs, idx, answers]);

  if (result) {
    return (
      <div className="space-y-3">
        <div className="font-semibold">MCQ Results</div>
        <div className="text-xs text-gray-600">Source: <span className="px-2 py-0.5 rounded bg-gray-100">{isAiCached('mcq', topicId) ? 'AI' : 'Mock'}</span></div>
        <div className="text-sm text-gray-700">Score: {result.raw}/{result.max} ({result.percent}%) — Grade {result.grade}</div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => { sessionStorage.removeItem(key); setQs(getMCQSet(topicId, 5)); setIdx(0); setAnswers({}); setResult(null); }}>Try Again</button>
          <button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  if (!qs.length) return <div>Loading…</div>;
  const q = qs[idx];

  const submit = () => {
    const picked = qs.map((_, i) => answers[i]);
    const { raw, max, percent } = scoreMCQ(qs, picked);
    actions.recordQuizResult(percent);
    setResult({ raw, max, percent, grade: gradeFromPercent(percent) });
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Question {idx+1} of {qs.length}</div>
      <div className="font-medium">{q.question}</div>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => (
          <label key={i} className={`p-2 border rounded cursor-pointer ${answers[idx] === i ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
            <input type="radio" name={`mcq-${idx}`} className="mr-2" checked={answers[idx] === i} onChange={() => setAnswers({ ...answers, [idx]: i })} />
            {opt}
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <button disabled={idx===0} className={`px-3 py-2 rounded ${idx===0 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setIdx(idx-1)}>Back</button>
        {idx < qs.length-1 ? (
          <button disabled={answers[idx]==null} className={`px-3 py-2 rounded ${answers[idx]==null ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`} onClick={() => setIdx(idx+1)}>Next</button>
        ) : (
          <button disabled={answers[idx]==null} className={`px-3 py-2 rounded ${answers[idx]==null ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`} onClick={submit}>Submit</button>
        )}
      </div>
    </div>
  );
}

function isAiCached(kind, topicId) {
  try {
    const key = kind === 'mcq' ? `runner-mcq-${topicId}` : kind === 'short' ? `runner-short-${topicId}` : `runner-scenario-${topicId}`;
    const rec = JSON.parse(sessionStorage.getItem(key));
    // naive heuristic: AI sets tend to have different shapes; for MCQ we trust if present after prefetch
    return !!rec && !!Object.keys(rec).length && !rec.mock;
  } catch { return false; }
}



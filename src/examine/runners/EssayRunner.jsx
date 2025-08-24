import React, { useEffect, useState } from 'react';
import { getEssayStem } from '../../mock/examData.js';
import { toPercent, gradeFromPercent } from '../../exam/score.js';
import useTopicProgress from '../../progress/useTopicProgress.js';
import { markEssay16 } from '../markers/gptMarker.js';
import { useAIService } from '../../hooks/useAIService.js';

export default function EssayRunner({ topicId, topicTitle, onClose }) {
  const { actions } = useTopicProgress(topicId);
  const { callAIWithPublicSources } = useAIService();
  const [stem, setStem] = useState({ prompt: '', bandDescriptors: {} });
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const key = `runner-essay-${topicId}`;

  useEffect(() => {
    try { const rec = JSON.parse(sessionStorage.getItem(key)); if (rec && rec.stem) { setStem(rec.stem); setAnswer(rec.answer||''); return; } } catch(_){}
    setStem(getEssayStem(topicId));
  }, [topicId]);
  useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify({ stem, answer })); } catch(_){} }, [stem, answer]);

  const submit = async () => {
    try {
      const r = await markEssay16(topicTitle || topicId, stem.prompt, answer, callAIWithPublicSources);
      const max = 16;
      const raw = Math.max(0, Math.min(max, Number(r.raw)||Number(r.marks)||0));
      const percent = toPercent(raw, max);
      actions.recordTimedEssay(percent);
      setResult({ raw, max, percent, grade: gradeFromPercent(percent), band: r.band || '', rationale: r.rationale || r.feedback || '', AO1: r.AO1 || '', AO2: r.AO2 || '', AO3: r.AO3 || '' });
    } catch(_) {
      const max = 16; const raw = Math.min(max, Math.round((answer.split(/\s+/).length/450)*max));
      const percent = toPercent(raw, max);
      actions.recordTimedEssay(percent);
      setResult({ raw, max, percent, grade: gradeFromPercent(percent), band: '', rationale: '', AO1: '', AO2: '', AO3: '' });
    }
  };

  if (result) return (
    <div className="space-y-3">
      <div className="font-semibold">Essay Results</div>
      <div className="text-xs text-gray-600">Source: <span className="px-2 py-0.5 rounded bg-gray-100">AI</span></div>
      <div className="text-sm text-gray-700">Score: {result.raw}/{result.max} ({result.percent}%) — Grade {result.grade} {result.band ? `(Level ${result.band})` : ''}</div>
      {(result.AO1 || result.AO2 || result.AO3) && (
        <div className="text-sm text-gray-700">
          <div>AO1: {result.AO1}</div>
          <div>AO2: {result.AO2}</div>
          <div>AO3: {result.AO3}</div>
        </div>
      )}
      {result.rationale && (
        <ul className="list-disc ml-5 text-sm text-gray-700">
          {result.rationale.split(/\n+/).slice(0,3).map((s,i)=>(<li key={i}>{s}</li>))}
        </ul>
      )}
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => { sessionStorage.removeItem(key); setStem(getEssayStem(topicId)); setAnswer(''); setResult(null); }}>Try Again</button>
        <button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">16-mark essay</div>
      <div className="font-medium">{stem.prompt}</div>
      <textarea rows="10" className="w-full border rounded p-2" value={answer} onChange={(e)=> setAnswer(e.target.value)} placeholder="Write your essay here…" />
      <div className="flex justify-end">
        <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}



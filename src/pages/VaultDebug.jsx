import React, { useMemo, useState } from 'react';
import { countQuestions, sample } from '../data/questionBank.js';

export default function VaultDebug() {
  const [topic, setTopic] = useState('biopsychology');
  const [mode, setMode] = useState('short');
  const [n, setN] = useState(6);

  const total = useMemo(() => countQuestions({ topic, mode }), [topic, mode]);
  const picked = useMemo(() => sample({ topic, mode, n }), [topic, mode, n]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Vault Debug</h1>
        <div className="border rounded-lg p-4 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Topic</label>
              <input value={topic} onChange={(e)=> setTopic(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mode</label>
              <select value={mode} onChange={(e)=> setMode(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="mcq">MCQ</option>
                <option value="short">Short</option>
                <option value="scenario">Scenario</option>
                <option value="essay">Essay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">N</label>
              <input type="number" min="1" value={n} onChange={(e)=> setN(Number(e.target.value)||1)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="text-sm text-gray-700">Total indexed: <span className="font-semibold">{total}</span></div>
        </div>

        <div className="border rounded-lg p-4 bg-white space-y-3">
          <div className="font-semibold">Sample ({picked.length})</div>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-800">
            {picked.map((q)=> (
              <li key={q.id}>
                <div className="font-medium">{q.stem}</div>
                {q.mode === 'mcq' && (
                  <ul className="list-disc ml-5">
                    {(q.choices||[]).map((c,i)=>(<li key={i}>{c}{i===q.answer ? ' ✅' : ''}</li>))}
                  </ul>
                )}
                {!!(q.indicative||[]).length && (
                  <div className="text-xs text-gray-600">Indicative: {(q.indicative||[]).join(', ')}</div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}



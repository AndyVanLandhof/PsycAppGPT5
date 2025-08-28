import React, { useState } from 'react';

export default function BankGenerator({ onBack }) {
  const [topic, setTopic] = useState('biopsychology');
  const [doMcq, setDoMcq] = useState(true);
  const [doShort, setDoShort] = useState(true);
  const [doScenario, setDoScenario] = useState(true);
  const [doEssay, setDoEssay] = useState(true);
  const [mcqCount, setMcqCount] = useState(60);
  const [shortCount, setShortCount] = useState(60);
  const [scenarioCount, setScenarioCount] = useState(40); // yields ~20
  const [essayBatches, setEssayBatches] = useState(5);   // 5x append (2 each)
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  function appendLog(line) {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} — ${line}`]);
  }

  async function callGen(kind, body) {
    const key = (typeof window !== 'undefined' && localStorage.getItem('openai-key')) || '';
    const res = await fetch('/api/generate-bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { 'x-openai-key': key } : {}) },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || `Failed ${kind}`);
    return json;
  }

  async function runAll() {
    setRunning(true);
    setLog([]);
    try {
      if (doMcq) {
        appendLog(`Generating MCQ x${mcqCount} for ${topic}…`);
        const j = await callGen('mcq', { topic, kind: 'mcq', count: mcqCount, save: true });
        appendLog(`MCQ saved: ${j.saved || 'not saved'}`);
      }
      if (doShort) {
        appendLog(`Generating Short answers x${shortCount} for ${topic}…`);
        const j = await callGen('short', { topic, kind: 'short', count: shortCount, save: true });
        appendLog(`Short saved: ${j.saved || 'not saved'}`);
      }
      if (doScenario) {
        appendLog(`Generating Scenario items (param ${scenarioCount} ⇒ ~${Math.ceil(scenarioCount/2)}) for ${topic}…`);
        const j = await callGen('scenario', { topic, kind: 'scenario', count: scenarioCount, save: true });
        appendLog(`Scenario saved: ${j.saved || 'not saved'}`);
      }
      if (doEssay) {
        appendLog(`Generating Essay stems in ${essayBatches} batches (append)…`);
        for (let i = 0; i < Number(essayBatches) || 0; i++) {
          // eslint-disable-next-line no-await-in-loop
          const j = await callGen('essay', { topic, kind: 'essay', count: 2, save: true, append: true });
          appendLog(`Essay batch ${i+1}/${essayBatches} saved: ${j.saved || 'not saved'}`);
        }
      }
      appendLog('Done ✅');
    } catch (e) {
      appendLog(`Error: ${e.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bank Generator</h1>
            <div className="text-sm text-gray-600">Create and save question banks for topics.</div>
          </div>
          {onBack && (
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Back</button>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input value={topic} onChange={(e)=> setTopic(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="biopsychology" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded p-3 bg-gray-50">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={doMcq} onChange={(e)=> setDoMcq(e.target.checked)} /> MCQ</label>
              <div className="text-xs text-gray-600 mt-1">Target 60 total</div>
              <input type="number" min="1" value={mcqCount} onChange={(e)=> setMcqCount(Number(e.target.value)||0)} className="mt-2 w-28 border rounded px-2 py-1 text-sm" />
            </div>
            <div className="border rounded p-3 bg-gray-50">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={doShort} onChange={(e)=> setDoShort(e.target.checked)} /> Short answers</label>
              <div className="text-xs text-gray-600 mt-1">Target 60 total</div>
              <input type="number" min="1" value={shortCount} onChange={(e)=> setShortCount(Number(e.target.value)||0)} className="mt-2 w-28 border rounded px-2 py-1 text-sm" />
            </div>
            <div className="border rounded p-3 bg-gray-50">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={doScenario} onChange={(e)=> setDoScenario(e.target.checked)} /> Scenario</label>
              <div className="text-xs text-gray-600 mt-1">Pass 40 to get ~20 items</div>
              <input type="number" min="2" value={scenarioCount} onChange={(e)=> setScenarioCount(Number(e.target.value)||0)} className="mt-2 w-28 border rounded px-2 py-1 text-sm" />
            </div>
            <div className="border rounded p-3 bg-gray-50">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={doEssay} onChange={(e)=> setDoEssay(e.target.checked)} /> Essay</label>
              <div className="text-xs text-gray-600 mt-1">Batches of 2; append {essayBatches}×</div>
              <input type="number" min="1" value={essayBatches} onChange={(e)=> setEssayBatches(Number(e.target.value)||0)} className="mt-2 w-28 border rounded px-2 py-1 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button disabled={running} onClick={runAll} className={`px-4 py-2 rounded ${running ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{running ? 'Generating…' : 'Generate & Save'}</button>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <div className="font-semibold mb-2">Log</div>
          <div className="text-xs text-gray-700 space-y-1 max-h-64 overflow-auto">
            {log.map((l, i) => (<div key={i}>{l}</div>))}
          </div>
        </div>
      </div>
    </div>
  );
}





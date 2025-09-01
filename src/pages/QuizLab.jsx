import React, { useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { useVaultService } from '../hooks/useVaultService';
import psychologyTopics from '../psychologyTopics';
import { topicData as rsTopicsAll } from '../topicData';
import { getSelectedCurriculum } from '../config/curricula';

export default function QuizLab({ onBack }) {
  const [raw, setRaw] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState({});
  const { callAIJsonOnly } = useAIService();
  const { createVaultPrompt } = useVaultService();
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych', []);
  const topicsSrc = useMemo(() => (curr === 'ocr-rs' ? rsTopicsAll : psychologyTopics), [curr]);
  const topicEntries = useMemo(() => Object.entries(topicsSrc), [topicsSrc]);
  const [topicId, setTopicId] = useState(topicEntries[0]?.[0] || Object.keys(topicsSrc)[0]);
  const [subId, setSubId] = useState(topicsSrc[topicEntries[0]?.[0] || Object.keys(topicsSrc)[0]]?.subTopics?.[0]?.id || '');

  const unifiedPrompt = (topicTitle, subTitle) => `You are an expert AQA/OCR examiner generating multiple-choice questions.

TASK: Create EXACTLY 10 MCQs (4 options, 1 correct) in strict JSON.

TOPIC: ${topicTitle}
SUB-TOPIC: ${subTitle}

Coverage (aim): AO1 5, AO2 3, AO3 2.

Rules:
- Stem must be specific and unambiguous; include sub-topic terms or named study where relevant.
- AO1 findings: include study + year in stem or explanation; keep options plausible and mutually exclusive.
- AO2: use a concise 1–2 sentence scenario or data snippet in the stem.
- AO3: one evaluative point (methodological issue or comparison) clearly tied to the theory/study.
- No meta-phrases (e.g., "according to the materials"). No "all/none of the above".

Return ONLY this JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "ao": "AO1" | "AO2" | "AO3",
      "explanation": "1–2 sentence rationale"
    }
  ]
}`;

  const extractFirstJson = (text) => {
    const m = String(text || '').match(/\{[\s\S]*\}/);
    return m ? m[0] : null;
  };

  const sanitize = (qset, subTitle) => {
    const cleanMeta = (s) => String(s||'').replace(/\s*Reference\s*\d+\.?/gi,'').replace(/\s*\(\s*Reference\s*\d+\s*\)/gi,'').trim();
    const normQ = (s) => {
      let t = cleanMeta(s);
      t = t.replace(/[.!…]+\s*$/,'');
      if (!/\?$/.test(t)) t += '?';
      return t.replace(/\?+$/,'?');
    };
    const uniq4 = (arr) => {
      const out = [];
      const seen = new Set();
      for (const x of arr || []) {
        const k = String(x||'').trim().toLowerCase();
        if (k && !seen.has(k)) { seen.add(k); out.push(String(x||'').trim()); }
        if (out.length === 4) break;
      }
      return out;
    };
    const fixed = (qset.questions||[]).map(q => {
      const opts = uniq4(q.options || []);
      let correct = Number.isInteger(q.answer) ? Math.max(0, Math.min(3, q.answer)) : 0;
      if (opts.length < 4) {
        const pad = ['Control group', 'Random assignment', 'Confounding variable', 'Ecological validity', 'Operationalization'];
        for (const p of pad) if (opts.length < 4 && !opts.includes(p)) opts.push(p);
      }
      if (correct >= opts.length) correct = 0;
      let question = normQ(q.question || '');
      // Repair generic stems
      if (/\b(key concept|important aspect|relate[s]? to the broader topic|best fits within)\b/i.test(question)) {
        question = normQ(`Which of the following best describes ${subTitle}?`);
      }
      // Align explanation to correct option text
      const correctText = opts[correct] || '';
      let explanation = cleanMeta(q.explanation || '').replace(/[.!?]*\s*$/,'');
      if (!explanation) explanation = `Correct answer: ${correctText}.`;
      else if (!explanation.toLowerCase().includes(correctText.toLowerCase())) explanation += `. This corresponds to: ${correctText}.`;
      return { question, options: opts.slice(0,4), correctAnswer: correct, explanation };
    });
    // De-dupe by stem
    const seenQ = new Set();
    const out = [];
    for (const it of fixed) {
      const sig = it.question.toLowerCase();
      if (!seenQ.has(sig)) { seenQ.add(sig); out.push(it); }
      if (out.length === 10) break;
    }
    // Top-up if needed by cloning with slight variant
    while (out.length < 10 && fixed.length > 0) {
      const base = fixed[out.length % fixed.length];
      const v = { ...base, question: base.question.replace('Which','Which one').replace('What','Which') };
      const sig = v.question.toLowerCase();
      if (!seenQ.has(sig)) { seenQ.add(sig); out.push(v); }
      else break;
    }
    return out;
  };

  const run = async () => {
    setLoading(true);
    setError('');
    setRaw(null);
    setParsed(null);
    try {
      const t = psychologyTopics[topicId];
      const s = t?.subTopics?.find(st => st.id === subId);
      const topicTitle = t?.title || 'Approaches in Psychology';
      const subTitle = s?.title || 'Social Learning Theory (Bandura)';
      const base = unifiedPrompt(topicTitle, subTitle);
      const prompt = createVaultPrompt(base, topicTitle, subTitle, true, { quiz: true });
      const resp = await callAIJsonOnly(prompt, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
      setRaw(resp);
      const json = extractFirstJson(resp);
      if (!json) throw new Error('No JSON in response');
      const data = JSON.parse(json);
      const items = sanitize(data, subTitle);
      setParsed(items);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const saveBank = async (setLabel, items) => {
    const payload = {
      curriculum: curr,
      topicId,
      subId,
      set: setLabel,
      bank: { questions: items }
    };
    const res = await fetch('/api/save-quiz-bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const runBatchSave = async () => {
    setLoading(true);
    setError('');
    try {
      const t = topicsSrc[topicId];
      const s = t?.subTopics?.find(st => st.id === subId);
      const topicTitle = t?.title || '';
      const subTitle = s?.title || '';
      const base = unifiedPrompt(topicTitle, subTitle);
      // Generate Set A
      const promptA = createVaultPrompt(base, topicTitle, subTitle, true, { quiz: true });
      const rawA = await callAIJsonOnly(promptA, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
      const jsonA = extractFirstJson(rawA);
      if (!jsonA) throw new Error('No JSON in Set A');
      const dataA = JSON.parse(jsonA);
      const itemsA = sanitize(dataA, subTitle);
      await saveBank('A', itemsA);
      // Generate Set B
      const rawB = await callAIJsonOnly(promptA, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
      const jsonB = extractFirstJson(rawB);
      if (!jsonB) throw new Error('No JSON in Set B');
      const dataB = JSON.parse(jsonB);
      const itemsB = sanitize(dataB, subTitle);
      await saveBank('B', itemsB);
      alert('Saved Set A and Set B to banks/quizzes');
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const buildForSubtopic = async (tid, tTitle, st) => {
    const key = `${tid}/${st.id}`;
    setStatuses(prev => ({ ...prev, [key]: 'running' }));
    try {
      const topicTitle = tTitle;
      const subTitle = st.title;
      const base = unifiedPrompt(topicTitle, subTitle);
      const promptWithVault = createVaultPrompt(base, topicTitle, subTitle, true, { quiz: true });
      // Set A
      const rawA = await callAIJsonOnly(promptWithVault, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
      const jsonA = extractFirstJson(rawA);
      if (!jsonA) throw new Error('No JSON in Set A');
      const dataA = JSON.parse(jsonA);
      const itemsA = sanitize(dataA, subTitle);
      await fetch('/api/save-quiz-bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ curriculum: curr, topicId: tid, subId: st.id, set: 'A', bank: { questions: itemsA } }) });
      // Set B
      const rawB = await callAIJsonOnly(promptWithVault, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
      const jsonB = extractFirstJson(rawB);
      if (!jsonB) throw new Error('No JSON in Set B');
      const dataB = JSON.parse(jsonB);
      const itemsB = sanitize(dataB, subTitle);
      await fetch('/api/save-quiz-bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ curriculum: curr, topicId: tid, subId: st.id, set: 'B', bank: { questions: itemsB } }) });
      setStatuses(prev => ({ ...prev, [key]: 'saved' }));
      // Optionally preview the last built items
      setParsed(itemsB);
    } catch (e) {
      setStatuses(prev => ({ ...prev, [key]: `error: ${e?.message || String(e)}` }));
    }
  };

  const runBuildAll = async () => {
    setLoading(true);
    setError('');
    try {
      const entries = Object.entries(topicsSrc);
      for (const [tid, t] of entries) {
        for (const st of (t.subTopics || [])) {
          // eslint-disable-next-line no-await-in-loop
          setParsed([{ question: `Building ${t.title} / ${st.title}…`, options: [], correctAnswer: 0, explanation: '' }]);
          const topicTitle = t.title;
          const subTitle = st.title;
          const base = unifiedPrompt(topicTitle, subTitle);
          const promptWithVault = createVaultPrompt(base, topicTitle, subTitle, true, { quiz: true });
          // Set A
          // eslint-disable-next-line no-await-in-loop
          const rawA = await callAIJsonOnly(promptWithVault, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
          const jsonA = extractFirstJson(rawA);
          if (!jsonA) throw new Error(`No JSON in Set A for ${tid}/${st.id}`);
          const dataA = JSON.parse(jsonA);
          const itemsA = sanitize(dataA, subTitle);
          // eslint-disable-next-line no-await-in-loop
          await fetch('/api/save-quiz-bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ curriculum: curr, topicId: tid, subId: st.id, set: 'A', bank: { questions: itemsA } }) });
          // Set B
          // eslint-disable-next-line no-await-in-loop
          const rawB = await callAIJsonOnly(promptWithVault, null, (localStorage.getItem('openai-model') || 'gpt-4o-mini'));
          const jsonB = extractFirstJson(rawB);
          if (!jsonB) throw new Error(`No JSON in Set B for ${tid}/${st.id}`);
          const dataB = JSON.parse(jsonB);
          const itemsB = sanitize(dataB, subTitle);
          // eslint-disable-next-line no-await-in-loop
          await fetch('/api/save-quiz-bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ curriculum: curr, topicId: tid, subId: st.id, set: 'B', bank: { questions: itemsB } }) });
        }
      }
      alert('Built and saved A/B sets for all sub-topics.');
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quiz Lab (Unified Prompt)</h1>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">← Back</button>
          )}
        </div>
        <p className="text-gray-700">Generate 10 MCQs using a single, holistic instruction set with Vault context. Pick any Psychology topic/sub-topic, then inspect raw JSON and sanitized items below.</p>
        <div className="bg-white border rounded p-3 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select
              value={topicId}
              onChange={(e) => {
                const newId = e.target.value;
                setTopicId(newId);
                setSubId(psychologyTopics[newId]?.subTopics?.[0]?.id || '');
              }}
              className="w-full px-3 py-2 border rounded"
            >
              {topicEntries.map(([id, t]) => (
                <option key={id} value={id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Topic</label>
            <select
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              {(psychologyTopics[topicId]?.subTopics || []).map(st => (
                <option key={st.id} value={st.id}>{st.title}</option>
              ))}
            </select>
          </div>
          <div>
            <button onClick={run} disabled={loading} className={`px-6 py-2 rounded text-white ${loading? 'bg-gray-400':'bg-blue-600 hover:bg-blue-700'}`}>{loading? 'Generating…' : 'Generate Quiz'}</button>
            <button onClick={runBatchSave} disabled={loading} className={`ml-2 px-6 py-2 rounded text-white ${loading? 'bg-gray-400':'bg-emerald-600 hover:bg-emerald-700'}`}>{loading? 'Saving…' : 'Build & Save A/B'}</button>
            <button onClick={runBuildAll} disabled={loading} className={`ml-2 px-6 py-2 rounded text-white ${loading? 'bg-gray-400':'bg-purple-600 hover:bg-purple-700'}`}>{loading? 'Running…' : 'Build All (A/B)'} </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">{error}</div>
        )}
        {raw && (
          <div className="bg-white border rounded p-3">
            <h3 className="font-semibold mb-2">Raw JSON (model):</h3>
            <pre className="text-xs whitespace-pre-wrap break-all">{raw}</pre>
          </div>
        )}
        {Array.isArray(parsed) && parsed.length > 0 && (
          <div className="bg-white border rounded p-3 space-y-3">
            <h3 className="font-semibold">Sanitized Questions ({parsed.length})</h3>
            {parsed.map((q, i) => (
              <div key={i} className="border rounded p-3">
                <div className="font-medium mb-2">Q{i+1}. {q.question}</div>
                <ul className="list-disc ml-6 text-sm">
                  {q.options.map((o, idx) => (
                    <li key={idx} className={idx===q.correctAnswer? 'font-semibold text-green-700':''}>{String.fromCharCode(65+idx)}. {o}</li>
                  ))}
                </ul>
                <div className="mt-2 text-sm text-blue-800">Explanation: {q.explanation}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white border rounded p-3 space-y-3">
          <h3 className="font-semibold">Per‑subtopic builder</h3>
          {topicEntries.map(([tid, t]) => (
            <div key={tid} className="border rounded p-3">
              <div className="font-medium mb-2">{t.title}</div>
              <ul className="space-y-2">
                {(t.subTopics || []).map(st => {
                  const key = `${tid}/${st.id}`;
                  const status = statuses[key] || '';
                  const isRunning = status === 'running';
                  return (
                    <li key={st.id} className="flex items-center justify-between">
                      <span className="text-sm">{st.title}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => buildForSubtopic(tid, t.title, st)}
                          disabled={isRunning}
                          className={`px-3 py-1 rounded text-white ${isRunning ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                          {isRunning ? 'Building…' : 'Create & Save A/B'}
                        </button>
                        {status && <span className="text-xs text-gray-600">{status}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



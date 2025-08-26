import React, { useEffect, useMemo, useRef, useState } from 'react';
import useTopicProgress from '../progress/useTopicProgress.js';
import { useAIService } from '../hooks/useAIService.js';
import { getTopicConfig } from '../examine/config.js';
import { gradeFromPercent } from '../exam/score.js';
import { getAqaStyleExamplesCached } from '../examine/aqaStyle.js';

function percentToGrade(pct) {
  const n = Number(pct) || 0;
  if (n >= 90) return 'A*';
  if (n >= 80) return 'A';
  if (n >= 70) return 'B';
  if (n >= 60) return 'C';
  return 'D';
}

function safeParseJson(text) {
  try { return JSON.parse(text); } catch (_) {}
  try { return JSON.parse(String(text).replace(/^```json\n?|```$/g, '').trim()); } catch (_) {}
  const m = String(text).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
}

export default function ExaminePage({ topicId, title, onBack }) {
  const { actions } = useTopicProgress(topicId);
  const { callAIWithPublicSources, callAIJsonOnly } = useAIService();
  const [mode, setMode] = useState(null); // 'mcq' | 'short' | 'scenario' | 'essay'
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const config = getTopicConfig(topicId);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [startedAt]);

  const startMode = (m) => {
    setMode(m);
    setStartedAt(Date.now());
    setElapsed(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Examine: {title}</h1>
            <div className="text-sm text-gray-600">{mode ? `Time: ${Math.floor(elapsed/60)}m ${elapsed%60}s` : 'Select a mode to begin'}</div>
          </div>
          {onBack && (
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Back</button>
          )}
        </div>

        {!mode && (
          <>
            <div className="border rounded-lg p-4 bg-white space-y-3">
              <div className="font-semibold">About AQA Exam Question Types</div>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                <li><span className="font-medium">MCQ (1 mark):</span> Identify/recall, methods, or application. 4 options, 1 correct.</li>
                <li><span className="font-medium">Short answers (2–6 marks):</span> Define/identify (2), outline two (4), explain with example (3–4), brief methods/ethics/data tasks.</li>
                <li><span className="font-medium">Scenario / Application (6 marks):</span> Apply a theory/model to a novel stem; link stem details to correct concepts.</li>
                <li><span className="font-medium">Essay (16 marks):</span> Discuss/evaluate a theory/approach; balanced AO1 knowledge and AO3 evaluation.</li>
              </ul>
              <div className="font-semibold">Assessment Objectives (Psychology)</div>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                <li><span className="font-medium">AO1:</span> Knowledge & understanding — accurate terms, definitions, descriptions.</li>
                <li><span className="font-medium">AO2:</span> Application — use knowledge in context (scenarios, data, cases).</li>
                <li><span className="font-medium">AO3:</span> Analysis & evaluation — strengths/limitations, methods, issues & debates.</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-white">
                <div className="font-semibold">MCQ Drill</div>
                <div className="text-sm text-gray-600">5 quick multiple-choice questions.</div>
                <button className="mt-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => startMode('mcq')}>Start</button>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <div className="font-semibold">Short Answers</div>
                <div className="text-sm text-gray-600">6 items, 2–6 marks each.</div>
                <button className="mt-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => startMode('short')}>Start</button>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <div className="font-semibold">Scenario / Application</div>
                <div className="text-sm text-gray-600">1–2 items, 6–12 marks total.</div>
                <button className="mt-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => startMode('scenario')}>Start</button>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <div className="font-semibold">Essay</div>
                <div className="text-sm text-gray-600">One 16-mark essay question.</div>
                <button className="mt-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => startMode('essay')}>Start</button>
              </div>
            </div>
          </>
        )}

        {mode === 'mcq' && <MCQDrill topicId={topicId} title={title} timer={config.timers.mcq} onBack={() => setMode(null)} onScored={(pct) => actions.recordQuizResult(pct)} />}
        {mode === 'short' && <ShortAnswers topicId={topicId} title={title} timer={config.timers.short} onBack={() => setMode(null)} onScored={(pct) => actions.recordQuizResult(pct)} />}
        {mode === 'scenario' && <ScenarioMode topicId={topicId} title={title} timer={config.timers.scenario} onBack={() => setMode(null)} onScored={(pct) => actions.recordQuizResult(pct)} />}
        {mode === 'essay' && <EssayMode topicId={topicId} title={title} timer={config.timers.essay} onBack={() => setMode(null)} onScored={(pct) => actions.recordTimedEssay(pct)} />}
      </div>
    </div>
  );

  function MCQDrill({ topicId, title, timer, onBack, onScored }) {
    const [qs, setQs] = useState([]);
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState([]); // indices
    const [done, setDone] = useState(false);
    const { callAIWithPublicSources } = useAIService();
    const ranRef = useRef(false);
    // autosave
    const key = `exam-mcq-${topicId}`;
    useEffect(() => {
      try {
        const rec = JSON.parse(sessionStorage.getItem(key));
        if (rec && rec.qs && rec.answers) { setQs(rec.qs); setAnswers(rec.answers); setIdx(rec.idx||0); }
      } catch (_) {}
    }, []);

    useEffect(() => { (async () => {
      if (ranRef.current) return; ranRef.current = true;
      const style = await getAqaStyleExamplesCached();
      const cues = (style.mcq || []).slice(0,2).join('\n');
      const prompt = `Create 5 multiple-choice questions (MCQs) for AQA Psychology topic: ${title}.
Style cues (do not copy text, only phrasing format):\n${cues}
Return JSON ONLY: { questions: [ { question: string, options: string[4], correctIndex: 0-3 } ] }.`;
      try {
        const text = await callAIWithPublicSources(prompt, title, null);
        const parsed = safeParseJson(text);
        const got = Array.isArray(parsed?.questions) ? parsed.questions.slice(0,5) : [];
        if (got.length === 5) setQs(got);
        else setQs(defaultMcq(title));
      } catch (_) {
        setQs(defaultMcq(title));
      }
    })(); }, [title]);

    useEffect(() => {
      try { sessionStorage.setItem(key, JSON.stringify({ qs, answers, idx })); } catch (_) {}
    }, [qs, answers, idx]);

    if (!qs.length) return <div className="bg-white border rounded p-4">Loading questions…</div>;

    const q = qs[idx];

    const finish = () => {
      const raw = qs.reduce((acc, qq, i) => acc + (answers[i] === qq.correctIndex ? 1 : 0), 0);
      const max = qs.length;
      const pct = Math.round((raw / max) * 100);
      onScored(pct);
      setDone({ raw, max, pct, grade: percentToGrade(pct) });
    };

    if (done) {
      return (
        <div className="bg-white border rounded p-4 space-y-3">
          <div className="font-semibold">MCQ Results</div>
          <div className="text-sm text-gray-700">Score: {done.raw}/{done.max} ({done.pct}%) — Grade {done.grade}</div>
          <button className="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Done</button>
        </div>
      );
    }

    return (
      <div className="bg-white border rounded p-4 space-y-4">
        <div className="font-semibold">Question {idx+1} of {qs.length}</div>
        <div className="text-gray-800">{q.question}</div>
        <div className="grid grid-cols-1 gap-2">
          {q.options.map((opt, i) => (
            <label key={i} className={`p-2 border rounded cursor-pointer ${answers[idx] === i ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
              <input type="radio" name={`mcq-${idx}`} className="mr-2" checked={answers[idx] === i} onChange={() => setAnswers({ ...answers, [idx]: i })} />
              {opt}
            </label>
          ))}
        </div>
        <div className="flex justify-between">
          <button disabled={idx===0} onClick={() => setIdx(idx-1)} className={`px-3 py-2 rounded ${idx===0 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200'}`}>Back</button>
          {idx < qs.length-1 ? (
            <button disabled={answers[idx] == null} onClick={() => setIdx(idx+1)} className={`px-3 py-2 rounded ${answers[idx] == null ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Next</button>
          ) : (
            <button disabled={answers[idx] == null} onClick={finish} className={`px-3 py-2 rounded ${answers[idx] == null ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`}>Finish</button>
          )}
        </div>
      </div>
    );
  }

  function ShortAnswers({ topicId, title, timer, onBack, onScored }) {
    const [items, setItems] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const { callAIWithPublicSources } = useAIService();
    const ranRef = useRef(false);
    const key = `exam-short-${topicId}`;
    useEffect(() => {
      try { const rec = JSON.parse(sessionStorage.getItem(key)); if (rec && rec.items) { setItems(rec.items); setAnswers(rec.answers||{}); } } catch(_){}
    }, []);

    useEffect(() => { (async () => {
      if (ranRef.current) return; ranRef.current = true;
      const style = await getAqaStyleExamplesCached();
      const cues = (style.short || []).slice(0,2).join('\n');
      const sys = 'You are an AQA 7182 question writer. Respond in strict JSON only.';
      const prompt = `Create 6 short-answer questions (2–6 marks each) for AQA Psychology topic: ${title}.
Style cues (do not copy text, only phrasing format):\n${cues}
Return JSON ONLY as { items: [ { prompt: string, max: number } ] }.`;
      try {
        const text = await callAIJsonOnly(prompt, sys, 'gpt-4o-mini');
        const parsed = safeParseJson(text);
        const got = Array.isArray(parsed?.items) ? parsed.items.slice(0,6) : [];
        if (got.length === 6) setItems(got);
        else setItems(defaultShort());
      } catch (_) {
        setItems(defaultShort());
      }
    })(); }, [title]);
    useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify({ items, answers })); } catch(_){} }, [items, answers]);

    const submit = async () => {
      const payload = {
        items,
        answers: items.map((it, i) => ({ prompt: it.prompt, max: it.max, answer: answers[i] || '' }))
      };
      const scoringPrompt = `Score the following short answers using AQA 7182 criteria. Return JSON ONLY: { raw: number, max: number, percent: number, perItem: number[] }\n\n${JSON.stringify(payload)}`;
      try {
        const text = await callAIWithPublicSources(scoringPrompt, title, null);
        const parsed = safeParseJson(text) || {};
        const max = Number(parsed.max) || items.reduce((a,b)=>a+ (b.max||4),0);
        const raw = Math.max(0, Math.min(max, Number(parsed.raw)||0));
        const pct = Math.round((raw/max)*100);
        setResult({ raw, max, pct, grade: percentToGrade(pct) });
        onScored(pct);
      } catch (_) {
        const max = items.reduce((a,b)=>a+ (b.max||4),0);
        const raw = items.reduce((a,_,i)=> a + Math.min((answers[i]||'').trim().split(/\s+/).length/20, 1)*(items[i].max||4), 0);
        const pct = Math.round((raw/max)*100);
        setResult({ raw: Math.round(raw), max, pct, grade: percentToGrade(pct) });
        onScored(pct);
      }
    };

    if (!items.length) return <div className="bg-white border rounded p-4">Loading questions…</div>;
    if (result) return (
      <div className="bg-white border rounded p-4 space-y-3">
        <div className="font-semibold">Short Answers Results</div>
        <div className="text-sm text-gray-700">Score: {result.raw}/{result.max} ({result.pct}%) — Grade {result.grade}</div>
        <button className="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Done</button>
      </div>
    );

    return (
      <div className="bg-white border rounded p-4 space-y-4">
        {items.map((it, i) => (
          <div key={i} className="space-y-2">
            <div className="text-sm font-medium">Q{i+1}. {it.prompt} <span className="text-gray-500">(max {it.max} marks)</span></div>
            <textarea className="w-full border rounded p-2" rows="3" value={answers[i]||''} onChange={(e)=> setAnswers({ ...answers, [i]: e.target.value })} />
          </div>
        ))}
        <div className="flex justify-end">
          <button className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={submit}>Submit</button>
        </div>
      </div>
    );
  }

  function ScenarioMode({ topicId, title, timer, onBack, onScored }) {
    const [items, setItems] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const { callAIWithPublicSources } = useAIService();
    const ranRef = useRef(false);
    const key = `exam-scenario-${topicId}`;
    useEffect(() => { try { const rec = JSON.parse(sessionStorage.getItem(key)); if (rec && rec.items) { setItems(rec.items); setAnswers(rec.answers||{}); } } catch(_){} }, []);

    useEffect(() => { (async () => {
      if (ranRef.current) return; ranRef.current = true;
      const style = await getAqaStyleExamplesCached();
      const cues = (style.scenario || []).slice(0,2).join('\n');
      const prompt = `Create 2 scenario/application questions (6 marks each) for AQA Psychology topic: ${title}.
Style cues (do not copy text, only phrasing format):\n${cues}
Return JSON ONLY as { items: [ { prompt: string, max: number } ] }.`;
      try {
        const text = await callAIWithPublicSources(prompt, title, null);
        const parsed = safeParseJson(text);
        const got = Array.isArray(parsed?.items) ? parsed.items.slice(0,2) : [];
        if (got.length === 2) setItems(got);
        else setItems(defaultScenario());
      } catch (_) {
        setItems(defaultScenario());
      }
    })(); }, [title]);
    useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify({ items, answers })); } catch(_){} }, [items, answers]);

    const submit = async () => {
      const payload = {
        items,
        answers: items.map((it, i) => ({ prompt: it.prompt, max: it.max, answer: answers[i] || '' }))
      };
      const scoringPrompt = `Score the following scenario/application answers using AQA 7182. Return JSON ONLY: { raw: number, max: number, percent: number }\n\n${JSON.stringify(payload)}`;
      try {
        const text = await callAIWithPublicSources(scoringPrompt, title, null);
        const parsed = safeParseJson(text) || {};
        const max = Number(parsed.max) || items.reduce((a,b)=>a+ (b.max||6),0);
        const raw = Math.max(0, Math.min(max, Number(parsed.raw)||0));
        const pct = Math.round((raw/max)*100);
        setResult({ raw, max, pct, grade: percentToGrade(pct) });
        onScored(pct);
      } catch (_) {
        const max = items.reduce((a,b)=>a+ (b.max||6),0);
        const raw = items.reduce((a,_,i)=> a + Math.min((answers[i]||'').trim().split(/\s+/).length/30, 1)*(items[i].max||6), 0);
        const pct = Math.round((raw/max)*100);
        setResult({ raw: Math.round(raw), max, pct, grade: percentToGrade(pct) });
        onScored(pct);
      }
    };

    if (!items.length) return <div className="bg-white border rounded p-4">Loading questions…</div>;
    if (result) return (
      <div className="bg-white border rounded p-4 space-y-3">
        <div className="font-semibold">Scenario Results</div>
        <div className="text-sm text-gray-700">Score: {result.raw}/{result.max} ({result.pct}%) — Grade {result.grade}</div>
        <button className="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Done</button>
      </div>
    );

    return (
      <div className="bg-white border rounded p-4 space-y-4">
        {items.map((it, i) => (
          <div key={i} className="space-y-2">
            <div className="text-sm font-medium">Q{i+1}. {it.prompt} <span className="text-gray-500">(max {it.max} marks)</span></div>
            <textarea className="w-full border rounded p-2" rows="4" value={answers[i]||''} onChange={(e)=> setAnswers({ ...answers, [i]: e.target.value })} />
          </div>
        ))}
        <div className="flex justify-end">
          <button className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={submit}>Submit</button>
        </div>
      </div>
    );
  }

  function EssayMode({ topicId, title, timer, onBack, onScored }) {
    const [promptText, setPromptText] = useState('');
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState(null);
    const { callAIWithPublicSources } = useAIService();
    const ranRef = useRef(false);
    const key = `exam-essay-${topicId}`;
    useEffect(() => { try { const rec = JSON.parse(sessionStorage.getItem(key)); if (rec && rec.promptText) { setPromptText(rec.promptText); setAnswer(rec.answer||''); } } catch(_){} }, []);

    useEffect(() => { (async () => {
      if (ranRef.current) return; ranRef.current = true;
      const style = await getAqaStyleExamplesCached();
      const cues = (style.essay || []).slice(0,1).join('\n');
      const p = `Create one 16-mark AQA Psychology 7182 essay question for topic: ${title}.
Style cues (do not copy text, only phrasing format):\n${cues}
Return JSON ONLY: { prompt: string }`;
      try {
        const text = await callAIWithPublicSources(p, title, null);
        const parsed = safeParseJson(text);
        setPromptText(parsed?.prompt || `Write a 16-mark essay about ${title}.`);
      } catch (_) {
        setPromptText(`Write a 16-mark essay about ${title}.`);
      }
    })(); }, [title]);
    useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify({ promptText, answer })); } catch(_){} }, [promptText, answer]);

    const submit = async () => {
      const scoringPrompt = `Score this 16-mark AQA Psychology essay out of 16 using AQA criteria. Return JSON ONLY: { raw: number, max: 16, percent: number, feedback: string }\n\nQUESTION: ${promptText}\n\nANSWER: ${answer}`;
      try {
        const text = await callAIWithPublicSources(scoringPrompt, title, null);
        const parsed = safeParseJson(text) || {};
        const max = 16;
        const raw = Math.max(0, Math.min(max, Number(parsed.raw)||0));
        const pct = Math.round((raw/max)*100);
        setResult({ raw, max, pct, grade: percentToGrade(pct), feedback: parsed.feedback || '' });
        onScored(pct);
      } catch (_) {
        const max = 16;
        const raw = Math.min(max, Math.round((answer.trim().split(/\s+/).length / 400) * max));
        const pct = Math.round((raw/max)*100);
        setResult({ raw, max, pct, grade: percentToGrade(pct), feedback: '' });
        onScored(pct);
      }
    };

    if (!promptText) return <div className="bg-white border rounded p-4">Loading essay prompt…</div>;
    if (result) return (
      <div className="bg-white border rounded p-4 space-y-3">
        <div className="font-semibold">Essay Results</div>
        <div className="text-sm text-gray-700">Score: {result.raw}/{result.max} ({result.pct}%) — Grade {result.grade}</div>
        {result.feedback && <div className="text-sm text-gray-700 whitespace-pre-wrap">Feedback: {result.feedback}</div>}
        <button className="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Done</button>
      </div>
    );

    return (
      <div className="bg-white border rounded p-4 space-y-4">
        <div className="text-sm font-medium">Essay Prompt</div>
        <div className="text-gray-800">{promptText}</div>
        <textarea className="w-full border rounded p-2" rows="10" value={answer} onChange={(e)=> setAnswer(e.target.value)} placeholder="Write your essay response here…" />
        <div className="flex justify-end">
          <button className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={submit}>Submit</button>
        </div>
      </div>
    );
  }

  function defaultMcq(title) {
    return [
      { question: `Which statement best relates to ${title}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctIndex: 1 },
      { question: `Identify a core idea in ${title}.`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      { question: `Select the correct description within ${title}.`, options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
      { question: `A typical finding about ${title} is…`, options: ['A', 'B', 'C', 'D'], correctIndex: 3 },
      { question: `In ${title}, which is true?`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 }
    ];
  }

  function defaultShort() {
    return new Array(6).fill(0).map((_,i)=> ({ prompt: `Short-answer question ${i+1}`, max: 4 }));
  }

  function defaultScenario() {
    return [ { prompt: 'Scenario question 1', max: 6 }, { prompt: 'Scenario question 2', max: 6 } ];
  }
}



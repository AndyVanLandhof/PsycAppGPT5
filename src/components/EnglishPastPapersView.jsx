import React, { useEffect, useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';
import { pastPaperIndex, getEdexcelPastPapersURL } from '../config/englishPastPapers';

function EnglishPastPapersView({ topicId, topicTitle }) {
  const { callAIJsonOnly } = useAIService();
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);
  const [items, setItems] = useState([]); // { year, paper, question, model }[]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const storageKey = `${curr}:englit-past-${topicId}`;

  const loadCache = () => { try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : null; } catch(_) { return null; } };
  const saveCache = (obj) => { try { localStorage.setItem(storageKey, JSON.stringify(obj||[])); } catch(_) {} };

  useEffect(() => {
    const cached = loadCache();
    if (cached && cached.length) { setItems(cached); return; }
    const list = pastPaperIndex[topicId] || [];
    setItems(list);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const buildModelPrompt = (q) => {
    return `You are an expert Edexcel A Level English Literature (9ET0) examiner.

TASK: Write an A* standard model response (approx 600–800 words) to the question below.
Rules:
- Balance AO1/AO2/AO3/AO4 appropriately for the component.
- Use brief textual quotations (<= 90 chars) with act/scene/line or chapter cues.
- Integrate 1–2 recognised critics where appropriate.
- Clear thesis, coherent paragraphs, analytical depth, precise terminology.
- No introduction of texts outside the approved set.

Question: ${q}

STRICT JSON ONLY:
{ "model": "..." }`;
  };

  const generateModel = async (idx) => {
    const base = items[idx]; if (!base) return;
    setLoading(true); setError('');
    try {
      const raw = await callAIJsonOnly(buildModelPrompt(base.question), null, 'gpt-4o-mini');
      let parsed = null; try { parsed = JSON.parse(raw); } catch(_) { const m = String(raw||'').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
      const model = String(parsed?.model || '');
      const next = items.slice();
      next[idx] = { ...base, model };
      setItems(next); saveCache(next);
    } catch(e) {
      setError(e?.message || 'Failed to generate model answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{topicTitle} — Recent Past Papers <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 border border-amber-200">AI‑generated questions</span></div>
        <a href={getEdexcelPastPapersURL()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Edexcel past papers</a>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {(!items || items.length===0) && (
        <div className="text-sm text-gray-700">No curated questions yet for this text. Use the Edexcel past papers link above to browse.</div>
      )}
      <div className="space-y-4">
        {items.map((q, i) => (
          <div key={i} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-800 font-medium">{q.year} • {q.paper}</div>
              <button disabled={loading} onClick={() => generateModel(i)} className={`px-3 py-1 rounded text-white ${loading? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{loading ? 'Building…' : (q.model ? 'Rebuild Model' : 'Build Model')}</button>
            </div>
            <div className="mt-2 text-sm text-gray-800">{q.question}</div>
            {q.model && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded p-3 text-sm whitespace-pre-line leading-relaxed">{q.model}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnglishPastPapersView;



import React, { useEffect, useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';

function EnglishCriticismView({ topicId, topicTitle, partId, partLabel }) {
  const { callAIJsonOnly } = useAIService();
  const [items, setItems] = useState([]); // [{ critic, year, claim, counter }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);
  const storageKey = `${curr}:englit-crit-${topicId}-${partId}`;

  const loadCache = () => { try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : null; } catch(_) { return null; } };
  const saveCache = (arr) => { try { localStorage.setItem(storageKey, JSON.stringify(arr||[])); } catch(_) {} };

  const buildPrompt = () => {
    const where = partLabel ? `PART: ${partLabel}` : 'PART: Summary';
    return `You are an expert Edexcel A Level English Literature (9ET0) tutor. Use ONLY recognised critics listed in the system policy (e.g., Bradley, Eliot, Bloom, Esslin, Achebe, Said, Leavis). If none apply, say so in JSON with an empty list.

TEXT: ${topicTitle}
${where}

TASK: Provide 3–5 succinct critical perspectives directly relevant to this part/poem/scene.

Rules:
- Each item: critic (name), year (if known), claim (<= 30 words), optional counter (<= 25 words).
- STRICT JSON ONLY:
{
  "critics": [
    { "critic": "A. C. Bradley", "year": 1904, "claim": "...", "counter": "..." }
  ]
}`;
  };

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const raw = await callAIJsonOnly(buildPrompt(), null, 'gpt-4o-mini');
      let parsed = null; try { parsed = JSON.parse(raw); } catch(_) { const m = String(raw||'').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
      const rows = Array.isArray(parsed?.critics) ? parsed.critics : [];
      const clean = rows.map(r => ({ critic: String(r.critic||'').slice(0,80), year: r.year || '', claim: String(r.claim||'').slice(0,180), counter: String(r.counter||'').slice(0,140) })).slice(0,5);
      setItems(clean); saveCache(clean);
    } catch(e) { setError(e?.message || 'Failed to build criticism'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const cached = loadCache(); if (cached && cached.length>0) { setItems(cached); }
    // wait for Start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, partId]);

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-blue-600 hover:bg-blue-700'}`}>{loading?'Building…':'Start'}</button>
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-emerald-600 hover:bg-emerald-700'}`}>Refresh</button>
          <button onClick={() => { saveCache([]); setItems([]); }} className="px-3 py-1 rounded border">Clear</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {items.length===0 && !loading && !error && <div className="text-sm text-gray-600">No critical perspectives yet. Press Refresh to generate.</div>}
      {items.length>0 && (
        <div className="space-y-2">
          {items.map((it,i)=> (
            <div key={i} className="border rounded p-3 bg-gray-50">
              <div className="font-semibold text-gray-900">{it.critic}{it.year? ` (${it.year})`:''}</div>
              <div className="text-xs text-gray-700">{it.claim}</div>
              {it.counter && <div className="text-xs text-gray-600 mt-1">Possible counter: {it.counter}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnglishCriticismView;



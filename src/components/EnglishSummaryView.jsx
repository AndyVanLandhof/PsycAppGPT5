import React, { useEffect, useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';

function EnglishSummaryView({ topicId, topicTitle, partId, partLabel }) {
  const { callAIJsonOnly } = useAIService();
  const [data, setData] = useState(null); // { summary, bullets[] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);
  const storageKey = `${curr}:englit-summary-${topicId}-${partId}`;

  const loadCache = () => {
    try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : null; } catch(_) { return null; }
  };
  const saveCache = (obj) => { try { localStorage.setItem(storageKey, JSON.stringify(obj||{})); } catch(_) {} };

  const buildPrompt = () => {
    const where = partLabel ? `PART: ${partLabel}` : 'PART: Summary';
    return `You are an expert Edexcel A Level English Literature (9ET0) tutor. Use ONLY the approved primary text and recognised critics (as in the system policy). Do not introduce other works.

TEXT: ${topicTitle}
${where}

TASK: Provide an exam-focused SUMMARY for this specific part/poem/scene.

Rules:
- Write a concise paragraph of 200–300 words covering what happens and why it matters (themes/character/methods).
- Add 4–6 bullet points with the most examinable takeaways.
- STRICT JSON ONLY:
{
  "summary": "...",
  "bullets": ["...", "..."]
}`;
  };

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const raw = await callAIJsonOnly(buildPrompt(), null, 'gpt-4o-mini');
      let parsed = null; try { parsed = JSON.parse(raw); } catch(_) { const m = String(raw||'').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
      const out = {
        summary: String(parsed?.summary || ''),
        bullets: Array.isArray(parsed?.bullets) ? parsed.bullets.slice(0,6).map(x=>String(x)) : []
      };
      setData(out); saveCache(out);
    } catch(e) { setError(e?.message || 'Failed to build summary'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const cached = loadCache();
    if (cached && (cached.summary || (cached.bullets||[]).length)) { setData(cached); }
    // wait for Start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, partId]);

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-blue-600 hover:bg-blue-700'}`}>{loading?'Building…':'Start'}</button>
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-emerald-600 hover:bg-emerald-700'}`}>Refresh</button>
          <button onClick={() => { saveCache({}); setData(null); }} className="px-3 py-1 rounded border">Clear</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {!data && !loading && !error && (
        <div className="text-sm text-gray-600">No summary yet. Press Refresh to generate.</div>
      )}
      {data && (
        <>
          {data.summary && (
            <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-line">{data.summary}</div>
          )}
          {Array.isArray(data.bullets) && data.bullets.length>0 && (
            <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
              {data.bullets.map((b,i)=>(<li key={i}>{b}</li>))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default EnglishSummaryView;



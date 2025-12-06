import React, { useEffect, useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';

function EnglishExamView({ topicId, topicTitle, partId, partLabel }) {
  const { callAIJsonOnly } = useAIService();
  const [data, setData] = useState(null); // { frequency, angles[], tips[] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);
  const storageKey = `${curr}:englit-exam-${topicId}-${partId}`;

  const loadCache = () => { try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : null; } catch(_) { return null; } };
  const saveCache = (obj) => { try { localStorage.setItem(storageKey, JSON.stringify(obj||{})); } catch(_) {} };

  const buildPrompt = () => {
    const where = partLabel ? `PART: ${partLabel}` : 'PART: Summary';
    return `You are an expert Edexcel A Level English Literature (9ET0) tutor. Use ONLY permitted sources.

TEXT: ${topicTitle}
${where}

TASK: Give exam relevance for this part/poem/scene.

Rules:
- Provide frequency bands: High | Medium | Low (based on typical specification focus and common teaching emphases; if uncertain, justify briefly).
- Give 3–5 typical exam angles (themes/methods/contexts/critic links).
- Give 4–6 actionable tips (timing, comparison, quotation strategy, AO balance).
- STRICT JSON ONLY:
{
  "frequency": "High",
  "angles": ["...", "..."],
  "tips": ["...", "..."]
}`;
  };

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const raw = await callAIJsonOnly(buildPrompt(), null, 'gpt-4o-mini');
      let parsed = null; try { parsed = JSON.parse(raw); } catch(_) { const m = String(raw||'').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
      const out = {
        frequency: String(parsed?.frequency || 'Medium'),
        angles: Array.isArray(parsed?.angles) ? parsed.angles.slice(0,5).map(x=>String(x)) : [],
        tips: Array.isArray(parsed?.tips) ? parsed.tips.slice(0,6).map(x=>String(x)) : []
      };
      setData(out); saveCache(out);
    } catch(e) { setError(e?.message || 'Failed to build exam relevance'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const cached = loadCache(); if (cached && (cached.angles||[]).length) { setData(cached); return; }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, partId]);

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-emerald-600 hover:bg-emerald-700'}`}>{loading?'Building…':'Refresh'}</button>
          <button onClick={() => { saveCache({}); setData(null); }} className="px-3 py-1 rounded border">Clear</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {!data && !loading && !error && <div className="text-sm text-gray-600">No exam relevance yet. Press Refresh to generate.</div>}
      {data && (
        <div className="space-y-2">
          <div className="text-sm"><span className="font-semibold">Frequency:</span> {data.frequency}</div>
          {Array.isArray(data.angles) && data.angles.length>0 && (
            <div>
              <div className="font-semibold text-sm">Typical Exam Angles</div>
              <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
                {data.angles.map((a,i)=>(<li key={i}>{a}</li>))}
              </ul>
            </div>
          )}
          {Array.isArray(data.tips) && data.tips.length>0 && (
            <div>
              <div className="font-semibold text-sm">Tips</div>
              <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
                {data.tips.map((t,i)=>(<li key={i}>{t}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnglishExamView;






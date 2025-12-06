import React, { useEffect, useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';

function EnglishThemesView({ topicId, topicTitle, partId, partLabel }) {
  const { callAIJsonOnly } = useAIService();
  const [themes, setThemes] = useState([]); // [{ theme, summary, evidence }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);
  const storageKey = `${curr}:englit-themes-${topicId}-${partId}`;

  const loadCache = () => { try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : null; } catch(_) { return null; } };
  const saveCache = (obj) => { try { localStorage.setItem(storageKey, JSON.stringify(obj||[])); } catch(_) {} };

  const buildPrompt = () => {
    const where = partLabel ? `PART: ${partLabel}` : 'PART: Summary';
    return `You are an expert Edexcel A Level English Literature (9ET0) tutor. Use ONLY the approved primary text and recognised critics (as in the system policy). Do not introduce other works.

TEXT: ${topicTitle}
${where}

TASK: Identify the MAIN THEMES present in this part/poem/scene.

Rules:
- For each theme, give: name (short), a 1–2 sentence summary (<= 40 words), and 1 short piece of textual evidence (<= 90 chars, quoted) with a brief parenthetical ref (act/scene/part/line if known).
- STRICT JSON ONLY:
{
  "themes": [
    { "theme": "...", "summary": "...", "evidence": "\"...\" (Act III, Scene 1)" }
  ]
}`;
  };

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const raw = await callAIJsonOnly(buildPrompt(), null, 'gpt-4o-mini');
      let parsed = null; try { parsed = JSON.parse(raw); } catch(_) { const m = String(raw||'').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
      const items = Array.isArray(parsed?.themes) ? parsed.themes : [];
      const clean = items.map(t => ({ theme: String(t.theme||'').slice(0,80), summary: String(t.summary||'').slice(0,240), evidence: String(t.evidence||'').slice(0,140) })).slice(0,8);
      setThemes(clean); saveCache(clean);
    } catch(e) { setError(e?.message || 'Failed to build themes'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const cached = loadCache();
    if (cached && cached.length>0) { setThemes(cached); }
    // Do not auto-build; wait for Start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, partId]);

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-blue-600 hover:bg-blue-700'}`}>{loading?'Building…':'Start'}</button>
          <button onClick={fetchData} disabled={loading} className={`px-3 py-1 rounded text-white ${loading?'bg-gray-400':'bg-emerald-600 hover:bg-emerald-700'}`}>Refresh</button>
          <button onClick={() => { saveCache([]); setThemes([]); }} className="px-3 py-1 rounded border">Clear</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {themes.length===0 && !loading && !error && <div className="text-sm text-gray-600">No themes yet. Press Refresh to generate.</div>}
      {themes.length>0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {themes.map((t,i)=> (
            <div key={i} className="border rounded p-3 bg-gray-50">
              <div className="font-semibold text-gray-900">{t.theme}</div>
              <div className="text-xs text-gray-700 mb-1">{t.summary}</div>
              {t.evidence && <div className="text-xs text-gray-600 italic">{t.evidence}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnglishThemesView;



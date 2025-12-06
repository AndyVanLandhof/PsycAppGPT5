import React, { useEffect, useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';
import EnglishQuotations from './EnglishQuotations';

function EnglishQuotationsView({ topicId, topicTitle, partId, partLabel }) {
  const { callAIJsonOnly } = useAIService();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);

  const storageKey = `${curr}:englit-quotes-${topicId}-${partId}`;

  const AODESCS = {
    AO1: 'Articulate informed, personal responses using concepts/terminology; coherent written expression.',
    AO2: 'Analyse ways in which meanings are shaped in literary texts.',
    AO3: 'Demonstrate understanding of contextual significance and influence.',
    AO4: 'Explore connections across literary texts.'
  };

  const loadFromCache = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : null;
    } catch (_) {
      return null;
    }
  };

  const saveToCache = (items) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items || []));
    } catch (_) {}
  };

  const buildPrompt = () => {
    const where = partLabel ? `PART: ${partLabel}` : 'PART: Summary';
    return `You are an expert Edexcel A Level English Literature (9ET0) tutor. Use ONLY the approved primary text and recognised critics (as in the system policy). Do not introduce other works.

TEXT: ${topicTitle}
${where}

TASK: Return STRICT JSON (no extra text) with a compact set of exam-relevant quotations for this part of the text.

Rules:
- Each quotation must be short (<= 90 characters) and taken from the primary text.
- Provide a one-sentence explanation (<= 30 words) of why it matters (theme, character, method).
- Provide 2–3 sentence detail (60–100 words) developing the interpretation.
- Provide a recommended AO usage tag: AO1 | AO2 | AO3 | AO4, AND the official AO description text from the spec.
- Include a brief reference (e.g., Act/Scene, Part, or conventional label). If unknown, use an empty string.

Return JSON ONLY in this format:
{
  "quotes": [
    { "quote": "...", "explanation": "...", "detail": "...", "aoUsage": "AO2", "aoDescription": "...", "ref": "Act III, Scene 1" }
  ]
}`;
  };

  const fetchQuotes = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = buildPrompt();
      const raw = await callAIJsonOnly(prompt, null, 'gpt-4o-mini');
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        const m = String(raw || '').match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      const items = Array.isArray(parsed?.quotes) ? parsed.quotes : [];
      const clean = items
        .filter(q => q && typeof q.quote === 'string' && q.quote.trim().length > 0)
        .map(q => ({
          quote: String(q.quote).slice(0, 120),
          explanation: String(q.explanation || '').slice(0, 240),
          detail: String(q.detail || '').slice(0, 480),
          aoUsage: /AO[1234]/.test(String(q.aoUsage)) ? q.aoUsage : 'AO2',
          aoDescription: String(q.aoDescription || AODESCS[String(q.aoUsage || 'AO2')]).slice(0, 200),
          ref: String(q.ref || '').slice(0, 80)
        }))
        .slice(0, 12);
      setQuotes(clean);
      saveToCache(clean);
    } catch (e) {
      setError(e?.message || 'Failed to generate quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = loadFromCache();
    if (cached && cached.length > 0) {
      setQuotes(cached);
      return;
    }
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, partId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
        <div className="flex gap-2">
          <button onClick={fetchQuotes} disabled={loading} className={`px-3 py-1 rounded text-white ${loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{loading ? 'Building…' : 'Refresh'}</button>
          <button onClick={() => { saveToCache([]); setQuotes([]); }} className="px-3 py-1 rounded border">Clear</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {quotes.length === 0 && !loading && !error && (
        <div className="text-sm text-gray-600">No quotations yet. Press Refresh to generate.</div>
      )}
      <EnglishQuotations topicId={topicId} partId={partId} data={quotes} />
    </div>
  );
}

export default EnglishQuotationsView;



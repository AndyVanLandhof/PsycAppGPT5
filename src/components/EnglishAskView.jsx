import React, { useMemo, useState } from 'react';
import { useAIService } from '../hooks/useAIService';
import { getSelectedCurriculum } from '../config/curricula';
import { getEnglishTextURL } from '../config/englishTextLinks';

function EnglishAskView({ topicId, topicTitle, partId, partLabel }) {
  const { callAIJsonOnly } = useAIService();
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'edexcel-englit', []);
  const storageKey = `${curr}:englit-ask-${topicId}-${partId}`;
  const [question, setQuestion] = useState(() => {
    try { const raw = localStorage.getItem(storageKey+':lastQ'); return raw || ''; } catch(_) { return ''; }
  });
  const [answer, setAnswer] = useState(null); // { answer, points[] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showText, setShowText] = useState(false);

  const saveLastQuestion = (q) => { try { localStorage.setItem(storageKey+':lastQ', q || ''); } catch(_) {} };

  const buildPrompt = (q) => {
    const where = partLabel ? `PART: ${partLabel}` : 'PART: Summary';
    return `You are an expert Edexcel A Level English Literature (9ET0) tutor. Use ONLY the approved primary text and recognised critics (as in the system policy). Do not introduce other works.

TEXT: ${topicTitle}
${where}

QUESTION: ${q}

TASK: Provide a detailed, exam‑useful answer. Aim for up to ~500 words (write less if the question is very narrow). Use clear paragraphs, keep quotations short (<= 90 chars) and prefer paraphrase with brief act/scene/line or chapter refs. STRICT JSON ONLY:
{
  "answer": "...",
  "points": ["...", "..."]
}`;
  };

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true); setError('');
    try {
      saveLastQuestion(question);
      const raw = await callAIJsonOnly(buildPrompt(question), null, 'gpt-4o-mini');
      let parsed = null; try { parsed = JSON.parse(raw); } catch(_) { const m = String(raw||'').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
      const out = {
        answer: String(parsed?.answer || ''),
        points: Array.isArray(parsed?.points) ? parsed.points.slice(0,8).map(x=>String(x)) : []
      };
      setAnswer(out);
    } catch(e) {
      setError(e?.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
      <div className="text-sm text-gray-600">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Ask AI about this part</label>
        <textarea
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Type your question (e.g., How is memory used in this scene?)"
          value={question}
          onChange={(e)=>setQuestion(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          <button onClick={ask} disabled={loading || !question.trim()} className={`px-4 py-2 rounded text-white ${loading||!question.trim()?'bg-gray-400':'bg-blue-600 hover:bg-blue-700'}`}>{loading?'Asking…':'Ask'}</button>
          <button onClick={()=>{ setQuestion(''); setAnswer(null); setError(''); saveLastQuestion(''); }} className="px-4 py-2 rounded border">Clear</button>
          <button
            onClick={() => {
              const url = getEnglishTextURL(topicId, partId);
              if (url) {
                setShowText(true);
              } else {
                alert('Full text not available for this title due to copyright. Please use your set text or school login.');
              }
            }}
            className="px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700"
          >
            The Text
          </button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
      {answer && (
        <div className="space-y-2">
          {answer.answer && <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{answer.answer}</div>}
          {Array.isArray(answer.points) && answer.points.length>0 && (
            <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
              {answer.points.map((p,i)=>(<li key={i}>{p}</li>))}
            </ul>
          )}
        </div>
      )}

      {showText && (() => {
        const base = getEnglishTextURL(topicId, partId);
        const src = base ? (base + (base.includes('?') ? '&' : '?') + 'action=render') : '';
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-semibold text-gray-800">{topicTitle}{partLabel ? ` — ${partLabel}` : ''}</div>
                <div className="flex items-center gap-2">
                  {base && (
                    <a href={base} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Open in new tab</a>
                  )}
                  <button onClick={()=>setShowText(false)} className="px-3 py-1 rounded border text-sm">Close</button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {src ? (
                  <iframe title="Original Text" src={src} className="w-full h-full" />
                ) : (
                  <div className="p-4 text-sm text-gray-700">Full text not available.</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default EnglishAskView;



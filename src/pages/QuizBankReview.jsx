import React, { useEffect, useState } from 'react';

export default function QuizBankReview({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // { curriculum, topicId, subId, set, path, questions }

  const loadList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/list-quiz-banks');
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const openBank = async (it) => {
    try {
      const res = await fetch(it.path);
      if (!res.ok) throw new Error('Failed to load bank');
      const data = await res.json();
      setSelected({ ...it, questions: Array.isArray(data.questions) ? data.questions : [] });
    } catch (e) {
      setError(e?.message || String(e));
    }
  };

  useEffect(() => { loadList(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quiz Bank Review</h1>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">← Back</button>
          )}
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">{error}</div>}
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-2">Banks</h3>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="p-2">Curriculum</th>
                    <th className="p-2">Topic</th>
                    <th className="p-2">Sub-Topic</th>
                    <th className="p-2">Set</th>
                    <th className="p-2">Count</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{it.curriculum}</td>
                      <td className="p-2">{it.topicId}</td>
                      <td className="p-2">{it.subId}</td>
                      <td className="p-2">{it.set}</td>
                      <td className="p-2">{it.count ?? '—'}</td>
                      <td className="p-2">
                        <button onClick={() => openBank(it)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Open</button>
                        <a href={it.path} target="_blank" rel="noreferrer" className="ml-2 px-3 py-1 bg-gray-100 border rounded">View JSON</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-white border rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{selected.topicId} / {selected.subId} — Set {selected.set}</h3>
              <button onClick={() => setSelected(null)} className="text-sm px-3 py-1 border rounded">Close</button>
            </div>
            {selected.questions.length === 0 ? (
              <div className="text-gray-600">No questions loaded.</div>
            ) : (
              <div className="space-y-3">
                {selected.questions.map((q, i) => (
                  <div key={i} className="border rounded p-3">
                    <div className="font-medium">Q{i+1}. {q.question}</div>
                    <ul className="list-disc ml-6">
                      {(q.options||[]).map((o, idx) => (
                        <li key={idx} className={idx===q.correctAnswer? 'font-semibold text-green-700':''}>{String.fromCharCode(65+idx)}. {o}</li>
                      ))}
                    </ul>
                    <div className="mt-1 text-sm text-blue-800">Explanation: {q.explanation}</div>
                    {/* Future: Regenerate/Edit actions */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



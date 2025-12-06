import React from 'react';

function EnglishQuotations({ topicId, partId, data = [] }) {
  // data: [{ quote, explanation, aoUsage }]
  const items = Array.isArray(data) ? data : [];
  const columns = [[], [], []];
  for (let i = 0; i < items.length; i++) {
    columns[i % 3].push(items[i]);
  }
  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-emerald-700">Key Quotations</h3>
        <p className="text-gray-600 text-sm">Most examined lines for this part, with usage guidance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, idx) => (
          <div key={idx} className="space-y-3">
            {col.map((q, i) => (
              <div key={i} className="border rounded p-3 bg-gray-50">
                <div className="text-sm text-gray-900 italic mb-2">“{q.quote}”</div>
                <div className="text-xs text-gray-700 mb-2">{q.explanation}</div>
                {q.detail && (
                  <div className="text-xs text-gray-700 mb-2">{q.detail}</div>
                )}
                <div className="text-xs">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">AO usage: {q.aoUsage || 'AO1/AO2/AO3'}</span>
                  {q.aoDescription && (
                    <span className="ml-2 text-gray-600">— {q.aoDescription}</span>
                  )}
                  {q.ref && (
                    <span className="ml-2 text-gray-500">[{q.ref}]</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnglishQuotations;

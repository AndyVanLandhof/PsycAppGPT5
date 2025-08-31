import React, { useEffect, useMemo, useState } from 'react';
import { getSelectedCurriculum } from '../config/curricula';

function encodeSegments(relPath) {
  return String(relPath)
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');
}

export default function VaultDirectory({ onBack }) {
  const [items, setItems] = useState([]); // { group, name, pdfUrl }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const curr = useMemo(() => (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych', []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const base = curr === 'ocr-rs' ? '/vault/ocr-rs' : '/vault';
        const res = await fetch(`${base}/manifest.json`);
        if (!res.ok) {
          throw new Error(`Manifest not found at ${base}/manifest.json`);
        }
        const manifest = await res.json();
        const out = [];
        for (const rel of manifest) {
          // Derive group, filename, and pdf URL
          const parts = String(rel).split('/');
          const group = curr === 'ocr-rs'
            ? (parts[0] || 'General')
            : (parts[0] && parts[0].toLowerCase() === 'pastpapers' ? 'PastPapers' : 'Textbooks');
          const filename = parts[parts.length - 1] || rel;
          const pdfRel = rel.replace(/_chunks\.json$/i, '.pdf');
          const pdfUrl = `${base}/${encodeSegments(pdfRel)}`;
          out.push({ group, name: filename.replace(/_chunks\.json$/i, '.pdf'), pdfUrl });
        }
        // Sort by group, then name
        out.sort((a,b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
        setItems(out);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [curr]);

  // Group items by group key
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group).push(it);
    }
    return Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${curr==='ocr-rs' ? 'from-blue-50 to-blue-100' : 'from-pink-100 to-pink-200'} text-gray-800`}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Vault Directory</h1>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">← Back</button>
          )}
        </div>
        <p className="text-gray-700">Open source PDFs directly. {curr==='ocr-rs' ? 'Grouped by Philosophy, Ethics, Christianity and others.' : 'Grouped into Textbooks and PastPapers.'}</p>
        {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">{error}</div>}
        {loading ? (
          <div className="bg-white border rounded p-6">Loading…</div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([group, files]) => (
              <div key={group} className="bg-white border rounded shadow-sm">
                <div className="px-4 py-3 border-b font-semibold text-purple-700">{group}</div>
                <ul className="divide-y">
                  {files.map((f, idx) => (
                    <li key={idx} className="px-4 py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-800">{f.name}</span>
                      <a href={f.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Open PDF</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



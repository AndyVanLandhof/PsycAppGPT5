import React from 'react';
import StagePathway from './StagePathway.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function TopicTile({ title, status, onOpen }) {
  const rText = Number.isFinite(status?.rScore) ? `${status.rScore}%` : '—';
  const eText = Number.isFinite(status?.examScore) ? `${status.examScore}%` : '—';

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <StatusBadge message={status?.message || '—'} color={status?.color || 'gray'} />
      </div>
      <div className="mt-3">
        <StagePathway phase={status?.phase} />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Reinforce score: {rText} | Exam score: {eText}
      </div>
      <div className="mt-4">
        <button onClick={onOpen} className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
          Open Topic
        </button>
      </div>
    </div>
  );
}



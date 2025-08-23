import React from 'react';

const STEPS = [
  { key: 'Learn', label: 'Learn' },
  { key: 'Reinforce', label: 'Reinforce' },
  { key: 'Exam', label: 'Exam' },
  { key: 'Complete', label: 'Complete' }
];

export default function StagePathway({ phase = 'Learn' }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => {
        const isActive = step.key === phase;
        const isComplete = STEPS.findIndex(s => s.key === phase) > idx;
        const base = 'px-3 py-1 text-sm rounded-full border';
        const cls = isActive
          ? `${base} bg-indigo-600 text-white border-indigo-600`
          : isComplete
          ? `${base} bg-green-100 text-green-800 border-green-200`
          : `${base} bg-gray-100 text-gray-700 border-gray-200`;
        return (
          <div key={step.key} className={cls}>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}



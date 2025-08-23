import React, { useState } from 'react';
import useTopicProgress from '../progress/useTopicProgress.js';
import StatusBadge from '../progress/StatusBadge.jsx';
import StagePathway from '../progress/StagePathway.jsx';

export default function TopicPage({ topicId, title, onBack }) {
  const { topicState, status, actions } = useTopicProgress(topicId);
  const [flashPct, setFlashPct] = useState('');
  const [quizPct, setQuizPct] = useState('');
  const [paperPct, setPaperPct] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="mt-1">
              <StatusBadge message={status.message} color={status.color} />
            </div>
          </div>
          {onBack && (
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={onBack}>Back</button>
          )}
        </div>

        <StagePathway phase={status.phase} />

        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Learn</h2>
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => actions.recordLearnAccess('study')}>Open Study Content</button>
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => actions.recordLearnAccess('conceptMap')}>Open Concept Map</button>
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => actions.recordLearnAccess('audioStory')}>Play Audio Story</button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Reinforce</h2>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 w-24" placeholder="Flash %" value={flashPct} onChange={(e) => setFlashPct(e.target.value)} />
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => { actions.recordFlashcardsResult(flashPct); setFlashPct(''); }}>Record Flashcards</button>
          </div>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 w-24" placeholder="Quiz %" value={quizPct} onChange={(e) => setQuizPct(e.target.value)} />
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => { actions.recordQuizResult(quizPct); setQuizPct(''); }}>Record Quiz</button>
          </div>
          <div className="text-sm text-gray-600">Reinforce score: {Number.isFinite(status.rScore) ? `${status.rScore}%` : '—'}</div>
        </div>

        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Exam</h2>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 w-24" placeholder="Paper %" value={paperPct} onChange={(e) => setPaperPct(e.target.value)} />
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => { actions.recordPastPaper(paperPct); setPaperPct(''); }}>Record Past Paper</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500" onClick={actions.markComplete}>Mark Topic Complete</button>
          </div>
          <div className="text-sm text-gray-600">Exam score: {Number.isFinite(status.examScore) ? `${status.examScore}%` : '—'}</div>
        </div>

        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Debug / State</h2>
          <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(topicState, null, 2)}</pre>
          <button className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500" onClick={actions.resetTopic}>Reset Topic</button>
        </div>
      </div>
    </div>
  );
}



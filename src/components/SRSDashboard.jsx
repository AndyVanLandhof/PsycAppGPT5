import React, { useEffect, useMemo, useState } from 'react';
import psychologyTopics from '../psychologyTopics';
import { useAIService } from '../hooks/useAIService';

function isCardDue(card) {
  if (!card || !card.nextReview) return true;
  const today = new Date();
  const next = new Date(card.nextReview);
  return today >= next;
}

function getSubTopicCards(subTopicId) {
  return JSON.parse(localStorage.getItem(`srs-cards-${subTopicId}`) || '[]');
}

function getLastReviewDate(cards) {
  const dates = cards
    .map(c => c.lastReviewed ? new Date(c.lastReviewed) : null)
    .filter(Boolean)
    .map(d => d.getTime());
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates));
}

function formatSince(date) {
  if (!date) return 'Never reviewed';
  const now = new Date();
  const days = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function getNextDueDate(cards) {
  const future = cards
    .map(c => c.nextReview ? new Date(c.nextReview) : null)
    .filter(d => d && d.getTime() > Date.now())
    .map(d => d.getTime());
  if (future.length === 0) return null;
  return new Date(Math.min(...future));
}

function summarizeTopic(topicId) {
  const topic = psychologyTopics[topicId];
  let total = 0;
  let due = 0;
  (topic.subTopics || []).forEach(st => {
    const cards = getSubTopicCards(st.id);
    total += cards.length;
    due += cards.filter(isCardDue).length;
  });
  return { total, due };
}

function sm2Next(card, quality) {
  let repetitions = card.repetitions || 0;
  let easeFactor = card.easeFactor || 2.5;
  let interval = card.interval || 0; // days
  let minutesOffset = 0; // for same-day lapses

  if (quality >= 3) {
    repetitions = repetitions + 1;
    // Slightly longer first step than classic SM-2 (2 days instead of 1)
    if (repetitions === 1) interval = 2;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  } else {
    // Lapses: bring back same day to reinforce
    repetitions = 0;
    interval = 1; // keep canonical day interval for records
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    minutesOffset = quality === 1 ? 10 : 60; // 10 min for 1, 60 min for 2
  }

  let nextReview;
  if (minutesOffset > 0) {
    nextReview = new Date(Date.now() + minutesOffset * 60000);
  } else {
    nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
  }
  return { repetitions, easeFactor, interval, nextReview: nextReview.toISOString() };
}

export default function SRSDashboard({ onBack }) {
  const [navigationFilters, setNavigationFilters] = useState({ topic: 'all' });
  const [session, setSession] = useState(null); // { topicId, subTopic, cards, index, showAnswer, stats }
  const [deepDive, setDeepDive] = useState({ open: false, loading: false, content: '' });
  const { callAIWithVault } = useAIService();

  const allTopicsData = useMemo(() => {
    const out = {};
    Object.keys(psychologyTopics).forEach(tid => {
      out[tid] = {
        ...psychologyTopics[tid],
        stats: summarizeTopic(tid)
      };
    });
    return out;
  }, []);

  useEffect(() => {
    document.title = 'SRS Dashboard';
  }, []);

  const scrollToTopic = (topicId) => {
    const el = document.getElementById(`topic-${topicId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startSubTopicSession = (topicId, subTopic) => {
    const cards = getSubTopicCards(subTopic.id);
    const dueCards = cards.filter(isCardDue);
    if (dueCards.length === 0) return;
    setSession({
      topicId,
      subTopic,
      cards: dueCards,
      index: 0,
      showAnswer: false,
      userAnswer: '',
      stats: { perfect: 0, hard: 0, again: 0, total: 0 },
      mode: 'review'
    });
  };

  const startPracticeSession = (topicId, subTopic) => {
    const cards = getSubTopicCards(subTopic.id);
    if (cards.length === 0) return;
    setSession({
      topicId,
      subTopic,
      cards,
      index: 0,
      showAnswer: false,
      userAnswer: '',
      stats: { perfect: 0, hard: 0, again: 0, total: 0 },
      mode: 'practice'
    });
  };

  const handleAssess = (quality) => {
    if (!session) return;
    const current = session.cards[session.index];
    let history = [...(current.reviewHistory || []), { date: new Date().toISOString(), quality }];
    if (history.length > 50) history = history.slice(-50);

    let updated;
    const lsCards = getSubTopicCards(session.subTopic.id);
    const idx = lsCards.findIndex(c => c.id === current.id);

    if (session.mode === 'practice') {
      // Practice-only: record history but DO NOT change SRS scheduling fields
      updated = { ...current, reviewHistory: history };
      if (idx !== -1) lsCards[idx] = { ...lsCards[idx], reviewHistory: history };
      localStorage.setItem(`srs-cards-${session.subTopic.id}`, JSON.stringify(lsCards));
    } else {
      // Review mode: normal SM-2 scheduling
      updated = {
        ...current,
        ...sm2Next(current, quality),
        lastReviewed: new Date().toISOString(),
        reviewHistory: history
      };
      if (idx !== -1) lsCards[idx] = { ...lsCards[idx], ...updated };
      localStorage.setItem(`srs-cards-${session.subTopic.id}`, JSON.stringify(lsCards));
    }

    // Update in-session copy so History panel reflects latest attempt
    const newCards = [...session.cards];
    newCards[session.index] = updated;

    const isLast = session.index === session.cards.length - 1;
    const bucket = quality >= 4 ? 'perfect' : quality === 3 ? 'hard' : 'again';
    const nextStats = {
      ...session.stats,
      [bucket]: session.stats[bucket] + 1,
      total: session.stats.total + 1
    };

    if (isLast) {
      setSession(null);
      return;
    }
    setSession(s => ({ ...s, cards: newCards, index: s.index + 1, showAnswer: false, userAnswer: '', stats: nextStats }));
  };

  if (session) {
    const card = session.cards[session.index];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">SRS Review: {session.subTopic.title}</h1>
              <p className="text-gray-600">Card {session.index + 1} of {session.cards.length}</p>
            </div>
            <button onClick={() => setSession(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">← Back</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Question:</h2>
              <p className="text-lg text-gray-700">{card.question}</p>
            </div>

            {!session.showAnswer ? (
              <div className="space-y-4">
                <textarea
                  value={session.userAnswer}
                  onChange={(e) => setSession(s => ({ ...s, userAnswer: e.target.value }))}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32"
                />
                <button onClick={() => setSession(s => ({ ...s, showAnswer: true }))} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Show Answer</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Answer:</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{session.userAnswer || 'No answer provided'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Correct Answer:</h3>
                  <p className="text-gray-700 bg-green-50 p-3 rounded">{card.answer}</p>
                  <div className="mt-3">
                    <button
                      onClick={async () => {
                        setDeepDive({ open: true, loading: true, content: '' });
                        const prompt = `Provide a concise 6–8 line deep-dive explanation for: "${card.question}"\nFocus: AQA A-Level Psychology (${session.subTopic.title}).\nInclude: key concept, brief elaboration, 1 study or example, and a practical takeaway.`;
                        const text = await callAIWithVault(prompt, psychologyTopics[session.topicId].title, session.subTopic.title, { includeAdditional: false });
                        setDeepDive({ open: true, loading: false, content: String(text || '').trim() });
                      }}
                      className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      Deep Dive
                    </button>
                    {deepDive.open && (
                      <div className="mt-3 border border-purple-200 bg-purple-50 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold text-purple-800">Deep Dive</h4>
                          <button onClick={() => setDeepDive({ open: false, loading: false, content: '' })} className="text-xs text-purple-700 underline">Close</button>
                        </div>
                        {deepDive.loading ? (
                          <div className="text-sm text-gray-600">Generating...</div>
                        ) : (
                          <div className="whitespace-pre-wrap text-gray-800 text-sm leading-6 max-h-64 overflow-y-auto">
                            {deepDive.content}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">How well did you know this?</h3>
                    {Array.isArray(card.reviewHistory) && card.reviewHistory.length > 0 && (
                      <span className="text-xs text-gray-600">
                        Last: {card.reviewHistory[card.reviewHistory.length - 1].quality} (
                        {formatSince(new Date(card.reviewHistory[card.reviewHistory.length - 1].date))})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-3 text-center">
                    <button onClick={() => handleAssess(1)} className="py-3 px-2 bg-red-500 text-white rounded-lg hover:bg-red-600">1</button>
                    <button onClick={() => handleAssess(2)} className="py-3 px-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">2</button>
                    <button onClick={() => handleAssess(3)} className="py-3 px-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">3</button>
                    <button onClick={() => handleAssess(4)} className="py-3 px-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700">4</button>
                    <button onClick={() => handleAssess(5)} className="py-3 px-2 bg-green-600 text-white rounded-lg hover:bg-green-700">5</button>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 flex justify-between">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setSession(s => ({ ...s, showHistoryModal: true }))}
                      className="text-base font-semibold text-blue-700 underline"
                    >
                      History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* History Modal */}
        {session.showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Attempt History</h3>
                <button onClick={() => setSession(s => ({ ...s, showHistoryModal: false }))} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              {Array.isArray(card.reviewHistory) && card.reviewHistory.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {card.reviewHistory.slice().reverse().map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm text-gray-700">{new Date(r.date).toLocaleString()}</span>
                      <span className="text-sm font-semibold text-blue-700">Score: {r.quality}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No attempts recorded yet for this card.</div>
              )}
              <div className="mt-4 text-right">
                <button onClick={() => setSession(s => ({ ...s, showHistoryModal: false }))} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Spaced Repetition Dashboard</h1>
            <p className="text-gray-600 mt-2">Review your flashcards by subtopic</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">← Back to Study Methods</button>
          )}
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Navigation</h3>
            <span className="text-sm text-gray-500">Jump to specific topics</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={navigationFilters.topic}
                onChange={(e) => setNavigationFilters({ topic: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Topics</option>
                {Object.keys(allTopicsData).map(tid => (
                  <option key={tid} value={tid}>{allTopicsData[tid].title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => navigationFilters.topic !== 'all' && scrollToTopic(navigationFilters.topic)}
                disabled={navigationFilters.topic === 'all'}
                className={`w-full px-4 py-2 rounded-lg font-medium ${navigationFilters.topic === 'all' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                📍 Go to Topic
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Topics</h2>
          {Object.entries(allTopicsData).map(([tid, topic]) => (
            <div key={tid} id={`topic-${tid}`} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.component}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Cards</div>
                  <div className="text-xl font-bold text-blue-600">{topic.stats.total}</div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {topic.subTopics.map(st => {
                  const cards = getSubTopicCards(st.id);
                  const due = cards.filter(isCardDue);
                  const last = formatSince(getLastReviewDate(cards));
                  const nextDueAt = getNextDueDate(cards);
                  return (
                    <div key={st.id} className="border rounded-lg p-2 bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-gray-800 text-sm">{st.title}</h4>
                        <span className="text-xs text-gray-500">{cards.length} cards</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                        <span>Due: {due.length}</span>
                        <span>Last Review: {last}</span>
                      </div>
                      {cards.length > 0 && (
                        <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                          <span>Next Due: {nextDueAt ? new Date(nextDueAt).toLocaleString() : (due.length > 0 ? 'Now' : 'Not scheduled')}</span>
                          <span></span>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => startSubTopicSession(tid, st)}
                          disabled={due.length === 0}
                          className={`flex-1 py-1 px-2 rounded text-xs font-medium ${due.length > 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                          {due.length > 0 ? `Review ${due.length}` : 'No Cards Due'}
                        </button>
                        <button
                          onClick={() => startPracticeSession(tid, st)}
                          disabled={cards.length === 0}
                          className={`py-1 px-2 rounded text-xs font-medium ${cards.length > 0 ? 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          title="Practice any card (does not affect due scheduling)"
                        >
                          Practice Any Card
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
        {/* Deep Dive Modal */}
        {deepDive.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Deep Dive</h3>
                <button onClick={() => setDeepDive({ open: false, loading: false, content: '' })} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              {deepDive.loading ? (
                <div className="text-sm text-gray-600">Generating...</div>
              ) : (
                <div className="whitespace-pre-wrap text-gray-800 text-sm leading-6" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {deepDive.content}
                </div>
              )}
              <div className="mt-4 text-right">
                <button onClick={() => setDeepDive({ open: false, loading: false, content: '' })} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Close</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}



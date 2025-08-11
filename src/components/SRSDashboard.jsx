import React, { useEffect, useMemo, useState } from 'react';
import psychologyTopics from '../psychologyTopics';

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
  let interval = card.interval || 0;

  if (quality >= 3) {
    repetitions = repetitions + 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  } else {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  return { repetitions, easeFactor, interval, nextReview: nextReview.toISOString() };
}

export default function SRSDashboard({ onBack }) {
  const [navigationFilters, setNavigationFilters] = useState({ topic: 'all' });
  const [session, setSession] = useState(null); // { topicId, subTopic, cards, index, showAnswer, stats }

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
      stats: { perfect: 0, hard: 0, again: 0, total: 0 }
    });
  };

  const handleAssess = (quality) => {
    if (!session) return;
    const current = session.cards[session.index];
    let history = [...(current.reviewHistory || []), { date: new Date().toISOString(), quality }];
    if (history.length > 50) history = history.slice(-50);

    const updated = {
      ...current,
      ...sm2Next(current, quality),
      lastReviewed: new Date().toISOString(),
      reviewHistory: history
    };

    // Persist to localStorage
    const lsCards = getSubTopicCards(session.subTopic.id);
    const idx = lsCards.findIndex(c => c.id === current.id);
    if (idx !== -1) lsCards[idx] = { ...lsCards[idx], ...updated };
    localStorage.setItem(`srs-cards-${session.subTopic.id}`, JSON.stringify(lsCards));

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
    setSession(s => ({ ...s, index: s.index + 1, showAnswer: false, userAnswer: '', stats: nextStats }));
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
                      onClick={() => setSession(s => ({ ...s, showHistory: !s?.showHistory }))}
                      className="text-xs text-blue-700 underline"
                    >
                      {session?.showHistory ? 'Hide History' : 'History'}
                    </button>
                    {session?.showHistory && Array.isArray(card.reviewHistory) && card.reviewHistory.length > 0 && (
                      <div className="mt-2 border rounded bg-gray-50 p-2">
                        <div className="text-xs text-gray-700 mb-1 font-semibold">Last attempts</div>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {card.reviewHistory.slice(-5).reverse().map((r, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{new Date(r.date).toLocaleDateString()}</span>
                              <span>Score: {r.quality}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => startSubTopicSession(tid, st)}
                          disabled={due.length === 0}
                          className={`flex-1 py-1 px-2 rounded text-xs font-medium ${due.length > 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                          {due.length > 0 ? `Review ${due.length}` : 'No Cards Due'}
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
    </div>
  );
}



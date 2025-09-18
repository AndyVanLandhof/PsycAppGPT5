import React, { useEffect, useMemo, useState } from 'react';
import psychologyTopics from '../psychologyTopics';
import { topicData as rsTopics } from '../topicData';
import { themeMap } from '../data/themeMap';
import { getSelectedCurriculum } from '../config/curricula';

const getStorageKey = () => {
  const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  return `taught:${curr}`;
};

function loadTaught() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveTaught(data) {
  try { localStorage.setItem(getStorageKey(), JSON.stringify(data)); } catch (_) {}
}

export default function TaughtContent({ onBack }) {
  const curriculum = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  const topicsSrc = curriculum === 'ocr-rs' ? rsTopics : psychologyTopics;
  const [taught, setTaught] = useState(() => loadTaught());
  const [query, setQuery] = useState('');

  useEffect(() => { saveTaught(taught); }, [taught]);

  const topicList = useMemo(() => Object.values(topicsSrc), [topicsSrc]);

  const markAllTopic = (topicId, value) => {
    const topic = topicsSrc[topicId];
    if (!topic) return;
    const next = { ...taught };
    next[topicId] = next[topicId] || {};
    (topic.subTopics || []).forEach((sub) => {
      const themes = curriculum === 'aqa-psych' && themeMap[sub.id] ? themeMap[sub.id] : [sub.title];
      next[topicId][sub.id] = next[topicId][sub.id] || {};
      themes.forEach((th) => { next[topicId][sub.id][th] = value; });
    });
    setTaught(next);
  };

  const markSubAll = (topicId, subId, value) => {
    const next = { ...taught };
    next[topicId] = next[topicId] || {};
    const themes = curriculum === 'aqa-psych' && themeMap[subId] ? themeMap[subId] : [(topicsSrc[topicId]?.subTopics || []).find(s=>s.id===subId)?.title || 'Sub-topic'];
    next[topicId][subId] = next[topicId][subId] || {};
    themes.forEach((th) => { next[topicId][subId][th] = value; });
    setTaught(next);
  };

  const toggleTheme = (topicId, subId, theme, value) => {
    setTaught((prev) => {
      const next = { ...prev };
      next[topicId] = next[topicId] || {};
      next[topicId][subId] = next[topicId][subId] || {};
      next[topicId][subId][theme] = value;
      return next;
    });
  };

  const matchQuery = (text) => !query.trim() || String(text).toLowerCase().includes(query.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto p-6">
        <button className="text-blue-600 underline" onClick={onBack}>← Back to Settings</button>
        <div className="bg-white rounded-lg shadow p-5 mt-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold">Taught Content</h2>
              <div className="text-sm text-gray-600">Curriculum: {curriculum === 'ocr-rs' ? 'OCR Religious Studies' : 'AQA Psychology'} — mark themes as taught to prioritise the planner.</div>
            </div>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search topic/sub-topic/theme" className="px-3 py-2 border rounded w-64"/>
          </div>

          <div className="mt-4 space-y-6">
            {topicList.map((topic) => {
              const taughtTopic = taught[topic.id] || {};
              const subTopics = (topic.subTopics || []).filter(st => matchQuery(topic.title) || matchQuery(st.title));
              const taughtCount = Object.values(taughtTopic).reduce((a, subObj) => a + Object.values(subObj || {}).filter(Boolean).length, 0);
              let totalThemes = 0;
              (topic.subTopics || []).forEach(st => { totalThemes += (curriculum === 'aqa-psych' && themeMap[st.id] ? themeMap[st.id].length : 1); });
              return (
                <div key={topic.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                    <div>
                      <div className="font-semibold">{topic.title}</div>
                      <div className="text-xs text-gray-600">{taughtCount} / {totalThemes} marked taught</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>markAllTopic(topic.id, true)} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Mark topic taught</button>
                      <button onClick={()=>markAllTopic(topic.id, false)} className="px-2 py-1 text-xs bg-gray-200 rounded">Clear</button>
                    </div>
                  </div>
                  <div className="p-3 space-y-4">
                    {subTopics.map((sub) => {
                      const themes = curriculum === 'aqa-psych' && themeMap[sub.id] ? themeMap[sub.id] : [sub.title];
                      const subObj = taughtTopic[sub.id] || {};
                      const subCount = Object.values(subObj).filter(Boolean).length;
                      return (
                        <div key={sub.id} className="border rounded">
                          <div className="flex items-center justify-between p-2 bg-gray-50">
                            <div className="font-medium text-sm">{sub.title} <span className="text-xs text-gray-500">({subCount}/{themes.length})</span></div>
                            <div className="flex items-center gap-2">
                              <button onClick={()=>markSubAll(topic.id, sub.id, true)} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Mark sub-topic</button>
                              <button onClick={()=>markSubAll(topic.id, sub.id, false)} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Clear</button>
                            </div>
                          </div>
                          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {themes.filter(th => matchQuery(th)).map((th) => (
                              <label key={th} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50 border">
                                <input
                                  type="checkbox"
                                  checked={!!(taught[topic.id]?.[sub.id]?.[th])}
                                  onChange={(e)=>toggleTheme(topic.id, sub.id, th, e.target.checked)}
                                />
                                <span>{th}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}









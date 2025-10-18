import React, { useMemo, useState } from 'react';
import psychologyTopics from '../psychologyTopics';
import { topicData as rsTopics } from '../topicData';
import { themeMap } from '../data/themeMap';
import { getPlannerEvents, getLatestPhaseTimestamp } from '../progress/plannerEvents';
import { getSelectedCurriculum } from '../config/curricula';

function getTaught(curr) {
  try { const raw = localStorage.getItem(`taught:${curr}`); return raw ? JSON.parse(raw) : {}; } catch(_) { return {}; }
}

function buildItems({ taughtOnly }) {
  const items = [];
  const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  if (curr === 'aqa-psych') {
    const taughtPsych = getTaught('aqa-psych');
    Object.values(psychologyTopics).forEach(topic => {
      (topic.subTopics||[]).forEach(sub => {
        const themes = themeMap[sub.id] || [sub.title];
        themes.forEach(theme => {
          const isTaught = !!(taughtPsych[topic.id]?.[sub.id]?.[theme]);
          if (!taughtOnly || isTaught) {
            items.push({ subject: 'Psychology', topicId: topic.id, topic: topic.title, subId: sub.id, subTopic: sub.title, theme, taught: isTaught });
          }
        });
      });
    });
  } else {
    const taughtRS = getTaught('ocr-rs');
    Object.values(rsTopics).forEach(topic => {
      (topic.subTopics||[]).forEach(sub => {
        const theme = sub.title; // treat sub-topic as theme for PRE
        const isTaught = !!(taughtRS[topic.id]?.[sub.id]?.[theme]);
        if (!taughtOnly || isTaught) {
          items.push({ subject: 'PRE', topicId: topic.id, topic: topic.title, subId: sub.id, subTopic: sub.title, theme, taught: isTaught });
        }
      });
    });
  }
  return items;
}

// Commonality weights by topic id (higher = more frequent)
const PSYCH_WEIGHTS = {
  'research-methods': 10,
  'approaches-in-psychology': 9,
  'biopsychology': 9,
  'social-influence': 8,
  'memory': 8,
  'issues-and-debates': 7,
  'psychopathology': 6,
  // options moderate
  'schizophrenia': 6,
  'eating-behaviour': 5,
  'stress': 5,
  'aggression': 5,
  'forensic-psychology': 5,
  'addiction': 5,
  'attachment': 6
};

const RS_WEIGHTS = {
  // Philosophy high
  'arguments-existence-god': 9,
  'religious-language': 9,
  'religious-experience': 8,
  'nature-attributes-god': 8,
  'problem-of-evil': 8,
  'miracles': 7,
  // Ethics high core
  'natural-law': 8,
  'kantian-ethics': 8,
  'utilitarianism': 8,
  'situation-ethics': 7,
  // Christianity key
  'knowledge-god': 8,
  'jesus-christ': 8,
  'pluralism': 7,
  'death-afterlife': 7,
  // others
  'ancient-philosophical-influences': 5,
  'soul-mind-body': 6,
  'practices-identity': 5,
  'gender': 6,
  'secularism': 6,
  'euthanasia': 6,
  'business-ethics': 5,
  'sexual-ethics': 5
};

function scoreItem(it) {
  if (it.subject === 'Psychology') return PSYCH_WEIGHTS[it.topicId] || 4;
  return RS_WEIGHTS[it.topicId] || 4;
}

function planWeeks({ items, startDate, weeks, perWeek }) {
  const sorted = [...items].sort((a,b)=> scoreItem(b) - scoreItem(a));
  const schedule = new Array(weeks).fill(0).map((_,i)=>({ week:i+1, start:new Date(startDate.getTime()+i*7*24*3600*1000), items:[] }));
  let idx = 0;
  schedule.forEach(week => {
    for (let k=0;k<perWeek && idx<sorted.length;k++,idx++) {
      week.items.push(sorted[idx]);
    }
  });
  return schedule;
}

export default function Planner({ onBack }) {
  const [taughtOnly, setTaughtOnly] = useState(false);
  const [weeks, setWeeks] = useState(26);
  const [perWeek, setPerWeek] = useState(7);
  const [startISO, setStartISO] = useState('2025-09-01');

  const items = useMemo(()=> buildItems({ taughtOnly }), [taughtOnly]);
  const schedule = useMemo(()=> planWeeks({ items, startDate: new Date(startISO+'T00:00:00'), weeks, perWeek }), [items, startISO, weeks, perWeek]);
  const events = useMemo(()=> getPlannerEvents(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <button className="text-blue-600 underline" onClick={onBack}>← Back</button>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-sm text-gray-600">Start date</label>
              <input type="date" value={startISO} onChange={(e)=>setStartISO(e.target.value)} className="block px-3 py-2 border rounded"/>
            </div>
            <div>
              <label className="text-sm text-gray-600">Weeks</label>
              <input type="number" min={1} value={weeks} onChange={(e)=>setWeeks(Number(e.target.value)||1)} className="block w-24 px-3 py-2 border rounded"/>
            </div>
            <div>
              <label className="text-sm text-gray-600">Items/week</label>
              <input type="number" min={1} value={perWeek} onChange={(e)=>setPerWeek(Number(e.target.value)||1)} className="block w-24 px-3 py-2 border rounded"/>
            </div>
            <label className="flex items-center gap-2 ml-auto">
              <input type="checkbox" checked={taughtOnly} onChange={(e)=>setTaughtOnly(e.target.checked)}/>
              <span>Only taught content</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Weekly Plan</h2>
          <div className="space-y-3">
            {schedule.map(week => (
              <div key={week.week} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Week {week.week}</div>
                  <div className="text-sm text-gray-600">{week.start.toLocaleDateString()}</div>
                </div>
                <div className="mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-12 font-semibold text-xs text-gray-600">
                    <div className="md:col-span-8">Theme</div>
                    <div className="md:col-span-2 text-center">Learn</div>
                    <div className="md:col-span-2 text-center">Reinforce</div>
                  </div>
                  <div className="divide-y">
                    {week.items.map((it,i)=> {
                      const learnedAt = getLatestPhaseTimestamp(events, it.topicId, it.subId, it.theme, 'learn');
                      const reinforcedAt = getLatestPhaseTimestamp(events, it.topicId, it.subId, it.theme, 'reinforce');
                      return (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-12 py-2 text-sm items-center">
                          <div className="md:col-span-8">
                            <span className="font-medium">{it.subject}</span>: {it.topic} → {it.subTopic}{it.theme && it.theme!==it.subTopic ? ` — ${it.theme}` : ''}
                          </div>
                          <div className="md:col-span-2 text-center">
                            {learnedAt ? (<span title={new Date(learnedAt).toLocaleString()}>✅</span>) : '—'}
                          </div>
                          <div className="md:col-span-2 text-center">
                            {reinforcedAt ? (<span title={new Date(reinforcedAt).toLocaleString()}>✅</span>) : '—'}
                          </div>
                        </div>
                      );
                    })}
                    {week.items.length===0 && (
                      <div className="py-2 text-sm text-gray-500">No items allocated.</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



import { getSelectedCurriculum } from '../config/curricula';

const keyFor = (curr) => `planner:events:${curr}`;

export function getPlannerEvents(currOverride) {
  const curr = currOverride || (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  try { const raw = localStorage.getItem(keyFor(curr)); return raw ? JSON.parse(raw) : {}; } catch(_) { return {}; }
}

function savePlannerEvents(data, currOverride) {
  const curr = currOverride || (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  try { localStorage.setItem(keyFor(curr), JSON.stringify(data)); } catch(_) {}
}

export function logPlannerEvent({ phase, topicId, subId, theme, curriculum }) {
  const curr = curriculum || (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  const data = getPlannerEvents(curr);
  const now = new Date().toISOString();
  if (!data[topicId]) data[topicId] = {};
  if (!data[topicId][subId]) data[topicId][subId] = {};
  if (!data[topicId][subId][theme]) data[topicId][subId][theme] = { learn: [], reinforce: [] };
  const arr = data[topicId][subId][theme][phase === 'reinforce' ? 'reinforce' : 'learn'];
  arr.push(now);
  savePlannerEvents(data, curr);
}

export function getLatestPhaseTimestamp(events, topicId, subId, theme, phase) {
  const record = events?.[topicId]?.[subId]?.[theme];
  const field = phase === 'reinforce' ? 'reinforce' : 'learn';
  const listExact = record?.[field] || [];
  if (listExact.length) return listExact[listExact.length - 1];
  // Fallback: any theme under same subId
  const subObj = events?.[topicId]?.[subId] || {};
  let latest = null;
  Object.values(subObj).forEach((t) => {
    const lst = t?.[field] || [];
    if (lst.length) {
      const ts = lst[lst.length - 1];
      if (!latest || ts > latest) latest = ts;
    }
  });
  return latest;
}




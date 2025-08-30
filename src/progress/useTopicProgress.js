import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_THRESHOLDS, getProgressStatus } from './progressLogic.js';
import { getSelectedCurriculum } from '../config/curricula.js';

const BASE_KEY = 'jaimie-progress-v1';
const legacyKey = 'jaimie-progress-v1';
const currentKey = () => {
  try {
    const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
    return `progress:${curr}:${BASE_KEY}`;
  } catch (_) {
    return legacyKey;
  }
};

function safeLoadAll() {
  try {
    const key = currentKey();
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    console.warn('Progress storage load failed; resetting', e);
    return {};
  }
}

function safeSaveAll(data) {
  try {
    const key = currentKey();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Progress storage save failed; ignoring', e);
  }
}

// One-time migration: if Psych selected and legacy key exists but namespaced key missing, copy it
function migrateIfNeeded() {
  try {
    const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
    const namespaced = currentKey();
    const hasNamespaced = !!localStorage.getItem(namespaced);
    const hasLegacy = !!localStorage.getItem(legacyKey);
    if (curr === 'aqa-psych' && !hasNamespaced && hasLegacy) {
      const raw = localStorage.getItem(legacyKey);
      localStorage.setItem(namespaced, raw);
      console.info('[Progress] Migrated legacy progress to namespaced key');
    }
  } catch (_) {}
}

function createDefaultState() {
  return {
    learn: { study: false, conceptMap: false, audioStory: false },
    reinforce: { flashAvgPct: null, quizAvgPct: null, attempts: 0 },
    exam: { timedEssayPct: null, pastPaperPct: null, completed: false, attempts: 0 },
    lastUpdated: Date.now()
  };
}

export function useTopicProgress(topicId, thresholds = DEFAULT_THRESHOLDS) {
  const thresholdsRef = useRef(thresholds);
  thresholdsRef.current = thresholds;

  const [allProgress, setAllProgress] = useState(() => { migrateIfNeeded(); return safeLoadAll(); });

  // Ensure the topic state exists
  const topicState = useMemo(() => {
    if (!topicId) return createDefaultState();
    const existing = allProgress[topicId];
    return existing ? existing : createDefaultState();
  }, [allProgress, topicId]);

  const status = useMemo(() => getProgressStatus(topicState, thresholdsRef.current), [topicState]);

  const writeTopicState = useCallback((updater) => {
    setAllProgress((prev) => {
      const current = prev && typeof prev === 'object' ? prev : {};
      const currentTopic = current[topicId] || createDefaultState();
      const nextTopic = updater(currentTopic);
      const nextAll = { ...current, [topicId]: { ...nextTopic, lastUpdated: Date.now() } };
      safeSaveAll(nextAll);
      return nextAll;
    });
  }, [topicId]);

  // Actions
  const recordLearnAccess = useCallback((key) => {
    if (!['study', 'conceptMap', 'audioStory'].includes(key)) return;
    writeTopicState((curr) => ({
      ...curr,
      learn: { ...curr.learn, [key]: true }
    }));
  }, [writeTopicState]);

  const recordFlashcardsResult = useCallback((percent) => {
    const pct = Number(percent);
    if (isNaN(pct)) return;
    writeTopicState((curr) => ({
      ...curr,
      reinforce: {
        ...curr.reinforce,
        flashAvgPct: Math.max(0, Math.min(100, Math.round(pct))),
        attempts: (curr.reinforce?.attempts || 0) + 1
      }
    }));
  }, [writeTopicState]);

  const recordQuizResult = useCallback((percent) => {
    const pct = Number(percent);
    if (isNaN(pct)) return;
    writeTopicState((curr) => ({
      ...curr,
      reinforce: {
        ...curr.reinforce,
        quizAvgPct: Math.max(0, Math.min(100, Math.round(pct))),
        attempts: (curr.reinforce?.attempts || 0) + 1
      }
    }));
  }, [writeTopicState]);

  const recordTimedEssay = useCallback((percent) => {
    const pct = Number(percent);
    if (isNaN(pct)) return;
    writeTopicState((curr) => ({
      ...curr,
      exam: {
        ...curr.exam,
        timedEssayPct: Math.max(0, Math.min(100, Math.round(pct))),
        attempts: (curr.exam?.attempts || 0) + 1
      }
    }));
  }, [writeTopicState]);

  const recordPastPaper = useCallback((percent) => {
    const pct = Number(percent);
    if (isNaN(pct)) return;
    writeTopicState((curr) => ({
      ...curr,
      exam: {
        ...curr.exam,
        pastPaperPct: Math.max(0, Math.min(100, Math.round(pct))),
        attempts: (curr.exam?.attempts || 0) + 1
      }
    }));
  }, [writeTopicState]);

  const markComplete = useCallback(() => {
    writeTopicState((curr) => ({
      ...curr,
      exam: { ...curr.exam, completed: true }
    }));
  }, [writeTopicState]);

  const resetTopic = useCallback(() => {
    setAllProgress((prev) => {
      const next = { ...(prev && typeof prev === 'object' ? prev : {}) };
      next[topicId] = createDefaultState();
      safeSaveAll(next);
      return next;
    });
  }, [topicId]);

  // Keep localStorage in sync if other tabs modify it
  useEffect(() => {
    const onStorage = () => { setAllProgress(safeLoadAll()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const actions = {
    recordLearnAccess,
    recordFlashcardsResult,
    recordQuizResult,
    recordTimedEssay,
    recordPastPaper,
    markComplete,
    resetTopic
  };

  return { topicState, status, actions };
}

export default useTopicProgress;



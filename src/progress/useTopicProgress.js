import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_THRESHOLDS, getProgressStatus } from './progressLogic.js';

const STORAGE_KEY = 'jaimie-progress-v1';

function safeLoadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Progress storage save failed; ignoring', e);
  }
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

  const [allProgress, setAllProgress] = useState(() => safeLoadAll());

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
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setAllProgress(safeLoadAll());
      }
    };
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



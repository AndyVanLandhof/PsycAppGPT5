import { defaultScale } from '../exam/score.js';

// Default timers (seconds) and grade scale; allow per-topic overrides later
export const examineConfig = {
  timers: {
    mcq: 600,         // 10 minutes for 10 MCQs
    short: 1200,      // 20 minutes for 6 short answers
    scenario: 900,    // 15 minutes for 1–2 scenarios
    essay: 1800       // 30 minutes for 16-mark essay
  },
  gradeScale: defaultScale,
  perTopic: {
    // 'memory': { timers: { mcq: 480 }, gradeScale: [...] }
  }
};

export function getTopicConfig(topicId) {
  const base = examineConfig;
  const topic = (base.perTopic && base.perTopic[topicId]) || {};
  return {
    timers: { ...base.timers, ...(topic.timers || {}) },
    gradeScale: topic.gradeScale || base.gradeScale
  };
}
















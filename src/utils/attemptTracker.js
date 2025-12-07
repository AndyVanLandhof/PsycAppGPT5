/**
 * Attempt Tracker - tracks user attempts for Flashcards, Quiz, and Active Recall
 * Stores per sub-topic, per mode, with timestamps
 */

import { getSelectedCurriculum } from '../config/curricula';

const STORAGE_KEY_PREFIX = 'attempt-tracker';

function getStorageKey() {
  const curriculum = getSelectedCurriculum();
  return `${STORAGE_KEY_PREFIX}-${curriculum}`;
}

function loadAttempts() {
  try {
    const data = localStorage.getItem(getStorageKey());
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('[AttemptTracker] Failed to load:', e);
    return {};
  }
}

function saveAttempts(attempts) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(attempts));
  } catch (e) {
    console.error('[AttemptTracker] Failed to save:', e);
  }
}

/**
 * Generate a unique key for a sub-topic + mode combination
 */
function getKey(topicId, subTopicId, mode) {
  return `${topicId}::${subTopicId}::${mode}`;
}

/**
 * Log an attempt for a specific sub-topic and mode
 * @param {string} topicId - e.g., 'memory'
 * @param {string} subTopicId - e.g., 'multi-store-model'
 * @param {string} mode - 'flashcards' | 'quiz' | 'recall'
 * @param {number|null} bank - optional bank number (1 or 2) for flashcards
 */
export function logAttempt(topicId, subTopicId, mode, bank = null) {
  const attempts = loadAttempts();
  const key = getKey(topicId, subTopicId, mode);
  
  const existing = attempts[key] || { count: 0, lastAttempt: null, lastBank: null };
  attempts[key] = {
    count: existing.count + 1,
    lastAttempt: new Date().toISOString(),
    lastBank: bank || existing.lastBank, // Keep track of which bank was used
  };
  
  saveAttempts(attempts);
  const bankInfo = bank ? ` (Bank ${bank})` : '';
  console.log(`[AttemptTracker] Logged ${mode}${bankInfo} attempt for ${topicId}/${subTopicId} (total: ${attempts[key].count})`);
}

/**
 * Get attempt stats for a specific sub-topic and mode
 * @returns {{ count: number, lastAttempt: string | null, lastBank: number | null }}
 */
export function getAttemptStats(topicId, subTopicId, mode) {
  const attempts = loadAttempts();
  const key = getKey(topicId, subTopicId, mode);
  return attempts[key] || { count: 0, lastAttempt: null, lastBank: null };
}

/**
 * Get all attempt stats for a sub-topic (all modes)
 * @returns {{ flashcards: {count, lastAttempt}, quiz: {count, lastAttempt}, recall: {count, lastAttempt} }}
 */
export function getAllAttemptStats(topicId, subTopicId) {
  return {
    flashcards: getAttemptStats(topicId, subTopicId, 'flashcards'),
    quiz: getAttemptStats(topicId, subTopicId, 'quiz'),
    recall: getAttemptStats(topicId, subTopicId, 'recall'),
  };
}

/**
 * Format a date for display
 * @param {string|null} isoString - ISO date string
 * @param {number|null} bank - optional bank number to append
 */
export function formatLastAttempt(isoString, bank = null) {
  if (!isoString) return 'Never';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let timeStr;
  if (diffDays === 0) {
    // Today - show time
    timeStr = `Today ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    timeStr = 'Yesterday';
  } else if (diffDays < 7) {
    timeStr = `${diffDays} days ago`;
  } else {
    timeStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  
  // Append bank info if provided
  if (bank) {
    timeStr += ` (Bank ${bank})`;
  }
  
  return timeStr;
}


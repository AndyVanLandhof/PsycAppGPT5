/**
 * Reinforce Bank Loader
 * 
 * Loads pre-generated Flashcard, Quiz, and Active Recall content from JSON banks.
 * Falls back gracefully if banks don't exist.
 */

import { getSelectedCurriculum } from '../config/curricula';

// Cache for loaded banks to avoid repeated fetches
const bankCache = new Map();

/**
 * Get the bank file path for a given topic/subTopic/type
 */
function getBankPath(curriculum, topicId, subTopicId, type) {
  return `/banks/${curriculum}/${topicId}_${subTopicId}_${type}.json`;
}

/**
 * Load a bank from the public folder
 */
async function loadBank(curriculum, topicId, subTopicId, type) {
  const cacheKey = `${curriculum}:${topicId}:${subTopicId}:${type}`;
  
  // Check cache first
  if (bankCache.has(cacheKey)) {
    return bankCache.get(cacheKey);
  }
  
  const bankPath = getBankPath(curriculum, topicId, subTopicId, type);
  
  try {
    const response = await fetch(bankPath);
    if (!response.ok) {
      console.log(`[ReinforceBanks] No bank found at ${bankPath}`);
      return null;
    }
    
    const bank = await response.json();
    
    // Validate bank structure
    if (!bank || !Array.isArray(bank.items)) {
      console.warn(`[ReinforceBanks] Invalid bank structure at ${bankPath}`);
      return null;
    }
    
    // Cache the result
    bankCache.set(cacheKey, bank);
    console.log(`[ReinforceBanks] Loaded ${bank.items.length} items from ${bankPath}`);
    
    return bank;
  } catch (error) {
    console.log(`[ReinforceBanks] Failed to load ${bankPath}:`, error.message);
    return null;
  }
}

/**
 * Clear the bank cache (useful for testing/development)
 */
export function clearBankCache() {
  bankCache.clear();
}

// ============================================================================
// Flashcard Bank Functions
// ============================================================================

/**
 * Load flashcards from the bank for a given topic/subTopic
 * @returns {Array} Array of flashcard objects or null if not found
 */
export async function loadFlashcardBank(topicId, subTopicId) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const bank = await loadBank(curriculum, topicId, subTopicId, 'flashcards');
  return bank?.items || null;
}

/**
 * Get a random sample of flashcards from the bank
 * @param {string} topicId 
 * @param {string} subTopicId 
 * @param {number} count - Number of flashcards to return (default 5)
 * @returns {Array} Array of flashcard objects
 */
export async function sampleFlashcards(topicId, subTopicId, count = 5) {
  const allCards = await loadFlashcardBank(topicId, subTopicId);
  if (!allCards || allCards.length === 0) return null;
  
  // Shuffle and take first `count` items
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get flashcards with a specific AO distribution
 * @param {string} topicId 
 * @param {string} subTopicId 
 * @param {Object} distribution - e.g., { AO1: 3, AO2: 1, AO3: 1 }
 * @returns {Array} Array of flashcard objects
 */
export async function sampleFlashcardsByAO(topicId, subTopicId, distribution = { AO1: 3, AO2: 1, AO3: 1 }) {
  const allCards = await loadFlashcardBank(topicId, subTopicId);
  if (!allCards || allCards.length === 0) return null;
  
  // Group by AO
  const byAO = { AO1: [], AO2: [], AO3: [] };
  for (const card of allCards) {
    const ao = String(card.ao || '').toUpperCase();
    if (ao.includes('AO1')) byAO.AO1.push(card);
    else if (ao.includes('AO2')) byAO.AO2.push(card);
    else if (ao.includes('AO3')) byAO.AO3.push(card);
    else byAO.AO1.push(card); // Default to AO1
  }
  
  // Shuffle each group
  Object.keys(byAO).forEach(ao => {
    byAO[ao] = byAO[ao].sort(() => Math.random() - 0.5);
  });
  
  // Pick according to distribution
  const result = [];
  Object.entries(distribution).forEach(([ao, count]) => {
    const available = byAO[ao] || [];
    result.push(...available.slice(0, count));
  });
  
  // Shuffle the final result
  return result.sort(() => Math.random() - 0.5);
}

// ============================================================================
// Quiz Bank Functions
// ============================================================================

/**
 * Load quiz questions from the bank for a given topic/subTopic
 * @returns {Array} Array of quiz question objects or null if not found
 */
export async function loadQuizBank(topicId, subTopicId) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const bank = await loadBank(curriculum, topicId, subTopicId, 'quiz');
  return bank?.items || null;
}

/**
 * Get a random sample of quiz questions from the bank
 * @param {string} topicId 
 * @param {string} subTopicId 
 * @param {number} count - Number of questions to return (default 10)
 * @returns {Array} Array of quiz question objects
 */
export async function sampleQuizQuestions(topicId, subTopicId, count = 10) {
  const allQuestions = await loadQuizBank(topicId, subTopicId);
  if (!allQuestions || allQuestions.length === 0) return null;
  
  // Shuffle and take first `count` items
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ============================================================================
// Active Recall Bank Functions
// ============================================================================

/**
 * Load active recall prompts from the bank for a given topic/subTopic
 * @returns {Array} Array of recall prompt objects or null if not found
 */
export async function loadRecallBank(topicId, subTopicId) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const bank = await loadBank(curriculum, topicId, subTopicId, 'recall');
  return bank?.items || null;
}

/**
 * Get recall prompts for a specific AO
 * @param {string} topicId 
 * @param {string} subTopicId 
 * @param {string} ao - 'AO1', 'AO2', or 'AO3'
 * @returns {Array} Array of recall prompt objects for that AO
 */
export async function getRecallPromptsByAO(topicId, subTopicId, ao) {
  const allPrompts = await loadRecallBank(topicId, subTopicId);
  if (!allPrompts || allPrompts.length === 0) return null;
  
  const aoUpper = ao.toUpperCase();
  const filtered = allPrompts.filter(p => String(p.ao || '').toUpperCase() === aoUpper);
  
  // Shuffle and return
  return filtered.sort(() => Math.random() - 0.5);
}

/**
 * Get a single random recall prompt for a specific AO
 * @param {string} topicId 
 * @param {string} subTopicId 
 * @param {string} ao - 'AO1', 'AO2', or 'AO3'
 * @returns {Object} A single recall prompt object or null
 */
export async function getRandomRecallPrompt(topicId, subTopicId, ao) {
  const prompts = await getRecallPromptsByAO(topicId, subTopicId, ao);
  if (!prompts || prompts.length === 0) return null;
  return prompts[0];
}

// ============================================================================
// Bank Status Functions
// ============================================================================

/**
 * Check if a bank exists for a given topic/subTopic/type
 * @returns {boolean}
 */
export async function bankExists(topicId, subTopicId, type) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const bankPath = getBankPath(curriculum, topicId, subTopicId, type);
  
  try {
    const response = await fetch(bankPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get bank metadata (item count, generation date) without loading full content
 */
export async function getBankInfo(topicId, subTopicId, type) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const bank = await loadBank(curriculum, topicId, subTopicId, type);
  
  if (!bank) return null;
  
  return {
    itemCount: bank.items?.length || 0,
    generatedAt: bank.generatedAt,
    topic: bank.topicTitle,
    subTopic: bank.subTopicTitle
  };
}

/**
 * Get all available banks for a topic/subTopic
 */
export async function getAvailableBanks(topicId, subTopicId) {
  const types = ['flashcards', 'quiz', 'recall'];
  const results = {};
  
  for (const type of types) {
    const info = await getBankInfo(topicId, subTopicId, type);
    results[type] = info;
  }
  
  return results;
}

// ============================================================================
// Export default object for convenience
// ============================================================================

export default {
  // Flashcards
  loadFlashcardBank,
  sampleFlashcards,
  sampleFlashcardsByAO,
  
  // Quiz
  loadQuizBank,
  sampleQuizQuestions,
  
  // Active Recall
  loadRecallBank,
  getRecallPromptsByAO,
  getRandomRecallPrompt,
  
  // Utilities
  bankExists,
  getBankInfo,
  getAvailableBanks,
  clearBankCache
};


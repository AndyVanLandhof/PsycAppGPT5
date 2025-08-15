import { useState, useEffect } from 'react';
import { vaultLoader } from '../utils/vaultLoader';

// Vault is AQA Psychology only; remove PRE structure
const VAULT_STRUCTURE = {
  psychology: 'AQA Psychology',
  general: 'General'
};

export const useVaultService = () => {
  const [vaultData, setVaultData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Load vault data on mount
  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Vault Service] Loading vault data...');
      
      // Load vault using the vault loader
      const loadedData = await vaultLoader.loadVault();
      setVaultData(loadedData);
      
      // Get vault statistics
      const vaultStats = vaultLoader.getVaultStats();
      setStats(vaultStats);
      
      console.log('[Vault Service] Vault loaded successfully:', vaultStats);
    } catch (err) {
      setError('Failed to load vault data');
      console.error('[Vault Service] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get relevant context for a specific topic and subtopic
  const getRelevantContext = (topic, subTopic, includeAdditional = false) => {
    return vaultLoader.getRelevantChunks(topic, subTopic, includeAdditional);
  };

  // Create a comprehensive prompt with vault context
  const createVaultPrompt = (basePrompt, topic, subTopic, includeAdditional = false, opts = {}) => {
    // Get up to 12 most relevant chunks (AQA Psych only)
    const relevantContexts = getRelevantContext(topic, subTopic, includeAdditional).slice(0, 12);

    // Deduplicate by chunk id
    const allContexts = [...relevantContexts].filter(
      (chunk, idx, arr) => arr.findIndex(c => c.id === chunk.id) === idx
    ).slice(0, 12);

    if (allContexts.length === 0) {
      console.warn('[Vault Service] No relevant context found for:', topic, subTopic);
      return basePrompt;
    }

    const contextSection = allContexts
      .map((context, index) => 
        `REFERENCE ${index + 1} (${context.source} - Page ${context.page}):\n${context.content}\n`
      )
      .join('\n');

    // If this is for a quiz or flashcards, add stricter instructions and difficulty progression
    const isQuizOrFlashcard = opts.quiz || opts.flashcards;
    const difficultyInstructions = isQuizOrFlashcard ? `\n\nFor quizzes/flashcards:\n- Use ONLY the provided AQA Psychology materials below. Do NOT use general knowledge or invent content.\n- Reference specific details, studies, or theories from the materials above.\n- Vary difficulty appropriately across cards/questions.\n` : '';

    return `IMPORTANT: You are an expert A-Level Psychology teacher. Use the following AQA Psychology materials as your ONLY reference for providing comprehensive, detailed responses suitable for A-Level exam preparation.${difficultyInstructions}

 --- BEGIN AQA PSYCHOLOGY MATERIALS ---
${contextSection}
--- END MATERIALS ---

INSTRUCTIONS: ${basePrompt}

Remember: Do not use general knowledge. Only use the provided AQA Psychology materials above. Do not mention sources in answers.`;
  };

  // Get clickable references for UI display
  const getClickableReferences = (topic, subTopic, includeAdditional = false) => {
    if (!topic || !subTopic) return [];
    const relevantContexts = getRelevantContext(topic, subTopic, includeAdditional);
    if (!Array.isArray(relevantContexts)) return [];
    return relevantContexts
      .slice(0, 8)
      .map((context, index) => ({
        id: context.id,
        content: context.content,
        source: context.source,
        page: context.page,
        title: context.title,
        metadata: context.metadata,
        pdfUrl: context.pdfUrl || `/vault/${topic.toLowerCase()}/${context.metadata.type}/${context.source}`,
        referenceNumber: index + 1
      }));
  };

  // Get exam-specific context
  const getExamContext = (topic) => {
    return vaultLoader.getExamChunks(topic);
  };

  // Get revision and essay examples
  const getRevisionContext = (topic, subTopic) => {
    return vaultLoader.getRevisionChunks(topic, subTopic);
  };

  // Get vault statistics
  const getVaultStats = () => {
    return stats;
  };

  // Check if vault is loaded
  const isVaultLoaded = () => {
    return vaultLoader.isLoaded;
  };

  // Add a boolean for useEffect dependencies
  const vaultLoaded = vaultLoader.isLoaded;

  // Reload vault data
  const reloadVault = async () => {
    await loadVaultData();
  };

  return {
    vaultData,
    isLoading,
    error,
    stats,
    getRelevantContext,
    createVaultPrompt,
    getClickableReferences,
    getExamContext,
    getRevisionContext,
    getVaultStats,
    isVaultLoaded,
    vaultLoaded,
    reloadVault
  };
}; 
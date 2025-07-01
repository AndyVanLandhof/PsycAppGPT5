import { useState, useEffect } from 'react';
import { vaultLoader } from '../utils/vaultLoader';

// Vault structure mapping
const VAULT_STRUCTURE = {
  christianity: {
    core: 'Christianity/Core',
    additional: 'Christianity/Additional'
  },
  ethics: {
    core: 'Ethics/Core',
    additional: 'Ethics/Additional'
  },
  philosophy: {
    core: 'Philosophy/Core',
    additional: 'Philosophy/Additional'
  },
  general: 'General',
  examBoard: 'Exam Board Materials',
  revisionEssays: 'Revision & Essays',
  notes: 'Notes'
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
    // Get up to 10 most relevant chunks from all sources
    const relevantContexts = getRelevantContext(topic, subTopic, includeAdditional).slice(0, 10);

    // Always try to include up to 5 relevant Revision Guide chunks if available
    let revisionGuideChunks = [];
    if (vaultLoader.isLoaded && vaultLoader.vaultData['revisionEssays']) {
      revisionGuideChunks = vaultLoader.vaultData['revisionEssays']
        .filter(chunk =>
          chunk.source && chunk.source.toLowerCase().includes('revision guide') &&
          (chunk.content?.toLowerCase().includes(subTopic.toLowerCase()) ||
           chunk.title?.toLowerCase().includes(subTopic.toLowerCase()) ||
           chunk.metadata?.subtopic?.toLowerCase().includes(subTopic.toLowerCase()))
        )
        .slice(0, 5);
    }

    // Combine and deduplicate by chunk id
    const allContexts = [...revisionGuideChunks, ...relevantContexts].filter(
      (chunk, idx, arr) => arr.findIndex(c => c.id === chunk.id) === idx
    ).slice(0, 15);

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
    const difficultyInstructions = isQuizOrFlashcard ? `\n\nFor quizzes/flashcards:\n- Use ONLY the provided OCR and Revision Guide materials below. Do NOT use general knowledge or invent content.\n- Reference specific details, arguments, quotes, or scholars from the materials above.\n- The first 3 questions/flashcards should be easy, the next 3 medium, the last 4 hard (for quizzes; for flashcards, scale difficulty similarly).\n- Each explanation must reference the source material.\n` : '';

    return `IMPORTANT: You are an expert A-Level Religious Studies teacher. Use the following OCR-approved materials as your ONLY reference for providing comprehensive, detailed responses suitable for A-Level exam preparation.${difficultyInstructions}

--- BEGIN OCR/REVISION GUIDE MATERIALS ---
${contextSection}
--- END MATERIALS ---

INSTRUCTIONS: ${basePrompt}

Remember: Do not use general knowledge. Only use the provided OCR and Revision Guide materials above. Reference the material in every answer.`;
  };

  // Get clickable references for UI display
  const getClickableReferences = (topic, subTopic, includeAdditional = false) => {
    const relevantContexts = getRelevantContext(topic, subTopic, includeAdditional);
    
    return relevantContexts
      .slice(0, 8) // Increased from 5 to 8 to show more comprehensive coverage
      .map((context, index) => ({
        id: context.id,
        content: context.content,
        source: context.source,
        page: context.page,
        title: context.title,
        metadata: context.metadata,
        pdfUrl: `/vault/${topic.toLowerCase()}/${context.metadata.type}/${context.source}`,
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
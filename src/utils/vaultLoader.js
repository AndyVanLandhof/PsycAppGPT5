// Vault Loader Utility
// This handles loading your JSON chunk files from the vault structure

const VAULT_BASE_PATH = './src/utils/vault'; // Updated to point to the vault folder within the app

// Expected JSON chunk structure:
// {
//   "chunks": [
//     {
//       "id": "unique_id",
//       "content": "text content from the PDF",
//       "source": "filename.pdf",
//       "page": 1,
//       "title": "section title if available",
//       "metadata": {
//         "topic": "christianity/ethics/philosophy",
//         "subtopic": "specific subtopic",
//         "type": "core/additional/general/exam/revision/notes"
//       }
//     }
//   ]
// }

export class VaultLoader {
  constructor() {
    this.vaultData = {};
    this.isLoaded = false;
  }

  // Load all vault data
  async loadVault() {
    try {
      console.log('[Vault] Loading vault data...');
      
      const vaultStructure = {
        christianity: {
          core: await this.loadFolder('Christianity/Core'),
          additional: await this.loadFolder('Christianity/Additional')
        },
        ethics: {
          core: await this.loadFolder('Ethics/Core'),
          additional: await this.loadFolder('Ethics/Additional')
        },
        philosophy: {
          core: await this.loadFolder('Philosophy/Core'),
          additional: await this.loadFolder('Philosophy/Additional')
        },
        general: await this.loadFolder('General'),
        examBoard: await this.loadFolder('Exam Board Materials'),
        revisionEssays: await this.loadFolder('Revision & Essays'),
        notes: await this.loadFolder('Notes')
      };

      this.vaultData = vaultStructure;
      this.isLoaded = true;
      
      console.log('[Vault] Successfully loaded vault data');
      return vaultStructure;
    } catch (error) {
      console.error('[Vault] Error loading vault:', error);
      throw error;
    }
  }

  // Load all JSON files from a specific folder
  async loadFolder(folderPath) {
    try {
      // For browser-based loading, we'll use fetch to load JSON files
      // The files need to be accessible via HTTP (in public folder or served by dev server)
      const fullPath = `/vault/${folderPath}`;
      
      // Define files to try loading based on folder path
      let knownFiles = [];
      
      if (folderPath.includes('Christianity/Core')) {
        knownFiles = [
          'Religious Studies - Developments in Christian Thought_chunks.json',
          'Christian Thought - OCR Study Guide H573-3_chunks.json',
          'Christian Thought - Complete Guide_chunks.json'
        ];
      } else if (folderPath.includes('Ethics/Core')) {
        knownFiles = [
          'Religious Studies - Religion and Ethics_chunks.json',
          'Religious Studies - Religion and Ethics_2016_chunks.json'
        ];
      } else if (folderPath.includes('Philosophy/Core')) {
        knownFiles = [
          'Religious Studies - Philosophy of Religion_chunks.json',
          'Religious Studies - Philosophy of Religion_2016_chunks.json'
        ];
      } else if (folderPath.includes('Ethics/Additional')) {
        knownFiles = [
          // Add any additional ethics files here
        ];
      } else if (folderPath.includes('Philosophy/Additional')) {
        knownFiles = [
          // Add any additional philosophy files here
        ];
      } else if (folderPath.includes('Christianity/Additional')) {
        knownFiles = [
          // Add any additional christianity files here
        ];
      } else if (folderPath === 'General') {
        knownFiles = [
          // General files - for now using sample
          'sample_chunks.json'
        ];
      } else if (folderPath === 'Exam Board Materials') {
        knownFiles = [
          // Exam materials - for now using sample
          'sample_chunks.json'
        ];
      } else if (folderPath === 'Revision & Essays') {
        knownFiles = [
          // Revision materials - for now using sample
          'sample_chunks.json'
        ];
      } else if (folderPath === 'Notes') {
        knownFiles = [
          // Notes - for now using sample
          'sample_chunks.json'
        ];
      }
      
      let allChunks = [];
      
      for (const filename of knownFiles) {
        try {
          const response = await fetch(`${fullPath}/${filename}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`[Vault] Loaded ${folderPath}/${filename}:`, data.length || 0, 'chunks');
            
            // Convert the user's format to the expected format
            const convertedChunks = this.convertChunksFormat(data, folderPath, filename);
            allChunks.push(...convertedChunks);
          }
        } catch (error) {
          // File doesn't exist, continue to next
          continue;
        }
      }
      
      if (allChunks.length > 0) {
        console.log(`[Vault] Total chunks loaded for ${folderPath}:`, allChunks.length);
        return allChunks;
      }
      
      // Fallback to mock data if no real files found
      console.log(`[Vault] No files found in ${folderPath}, using mock data`);
      const mockChunks = [
        {
          id: `${folderPath}-1`,
          content: `Sample content from ${folderPath}. This would be actual text from your OCR materials.`,
          source: `${folderPath}/sample.pdf`,
          page: 1,
          title: `Sample from ${folderPath}`,
          metadata: {
            topic: this.extractTopicFromPath(folderPath),
            subtopic: 'sample',
            type: this.extractTypeFromPath(folderPath)
          }
        }
      ];

      return mockChunks;
    } catch (error) {
      console.error(`[Vault] Error loading folder ${folderPath}:`, error);
      return [];
    }
  }

  // Convert user's chunk format to the expected format
  convertChunksFormat(rawChunks, folderPath, filename) {
    const convertedChunks = [];
    for (let i = 0; i < rawChunks.length; i++) {
      const chunk = rawChunks[i];
      // Support both new (content/title) and old (text) formats
      let content = '';
      let title = '';
      let page = chunk.page || chunk.pdf_page || null;
      if (chunk.content && chunk.title) {
        content = chunk.content.trim();
        title = chunk.title.trim();
      } else if (chunk.text) {
        content = chunk.text.trim();
        title = this.extractTitleFromContent(chunk.text);
      }
      if (content && content.length > 2) {
        const pdfUrl = `/vault/${folderPath}/${filename.replace('_chunks.json', '.pdf')}`;
        const convertedChunk = {
          id: `${folderPath}-${filename}-${i}`,
          content,
          source: filename.replace('_chunks.json', '.pdf'),
          page,
          title,
          pdfUrl,
          metadata: {
            topic: this.extractTopicFromPath(folderPath),
            subtopic: this.extractSubtopicFromPath(folderPath, filename),
            type: this.extractTypeFromPath(folderPath)
          }
        };
        convertedChunks.push(convertedChunk);
      }
    }
    return convertedChunks;
  }

  // Extract source filename from folder path
  extractSourceFromPath(path) {
    const parts = path.split('/');
    return parts[parts.length - 1] + '.pdf';
  }

  // Extract subtopic from folder path and filename
  extractSubtopicFromPath(path, filename) {
    // This is a simple extraction - you might want to enhance this
    if (path.includes('Christian Thought') || filename.includes('Christian Thought')) return 'christian thought';
    if (path.includes('Ethics') || filename.includes('Ethics')) return 'ethics';
    if (path.includes('Philosophy') || filename.includes('Philosophy')) return 'philosophy';
    return 'general';
  }

  // Extract title from content
  extractTitleFromContent(content) {
    // Try to find a meaningful title from the content
    const lines = content.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.length > 10 && line.length < 100 && !line.includes('•')) {
        return line.trim();
      }
    }
    return 'Untitled';
  }

  // Extract topic from folder path
  extractTopicFromPath(path) {
    if (path.includes('Christianity')) return 'christianity';
    if (path.includes('Ethics')) return 'ethics';
    if (path.includes('Philosophy')) return 'philosophy';
    return 'general';
  }

  // Extract type from folder path
  extractTypeFromPath(path) {
    if (path.includes('Core')) return 'core';
    if (path.includes('Additional')) return 'additional';
    if (path.includes('Exam Board')) return 'exam';
    if (path.includes('Revision')) return 'revision';
    if (path.includes('Notes')) return 'notes';
    return 'general';
  }

  // Get relevant chunks for a topic and subtopic
  getRelevantChunks(topic, subTopic, includeAdditional = false) {
    if (!this.isLoaded) {
      console.warn('[Vault] Vault not loaded yet');
      return [];
    }

    // EMERGENCY FIX: Always search all real data
    const chunks = [];
    if (this.vaultData.philosophy?.core) chunks.push(...this.vaultData.philosophy.core);
    if (this.vaultData.christianity?.core) chunks.push(...this.vaultData.christianity.core);
    if (this.vaultData.ethics?.core) chunks.push(...this.vaultData.ethics.core);
    console.log('[Vault][Debug] FORCED - Total chunks to search:', chunks.length);
    if (chunks.length > 0) {
      for (let i = 0; i < Math.min(3, chunks.length); i++) {
        console.log(`[Vault][Debug] Chunk ${i}:`, {
          hasContent: !!chunks[i].content,
          contentLength: chunks[i].content?.length,
          contentPreview: chunks[i].content?.substring(0, 100),
          title: chunks[i].title,
          page: chunks[i].page
        });
      }
    }
    console.log('[Vault][Debug] Search terms:', subTopic);

    if (chunks.length === 0) {
      console.warn('[Vault] No chunks found for topic:', topic);
      return [];
    }

    // Enhanced normalize search terms
    let searchTerms = this.normalizeSearchTerms(subTopic);
    console.log('[Vault][Debug] Enhanced search terms:', searchTerms);

    // 1. Main search: fuzzy/partial match in title, content, metadata
    let relevantChunks = chunks.filter(chunk => {
      const content = chunk.content?.toLowerCase() || '';
      const title = chunk.title?.toLowerCase() || '';
      const subtopic = chunk.metadata?.subtopic?.toLowerCase() || '';
      const meta = JSON.stringify(chunk.metadata || {}).toLowerCase();
      return searchTerms.some(term =>
        content.includes(term) ||
        title.includes(term) ||
        subtopic.includes(term) ||
        meta.includes(term)
      );
    });
    console.log('[Vault][Debug] Main search matched:', relevantChunks.length);
    if (relevantChunks.length > 0) {
      console.log('[Vault][Debug] First main matched chunk:', relevantChunks[0].title, relevantChunks[0].content?.slice(0, 200));
    }

    // 2. Secondary pass: boost chunks where title/content starts with or closely matches search term
    if (relevantChunks.length === 0) {
      relevantChunks = chunks.filter(chunk => {
        const content = chunk.content?.toLowerCase() || '';
        const title = chunk.title?.toLowerCase() || '';
        return searchTerms.some(term =>
          title.startsWith(term) ||
          content.startsWith(term) ||
          title.replace(/[^a-z0-9]/g, '').includes(term.replace(/[^a-z0-9]/g, ''))
        );
      });
      console.log('[Vault][Debug] Secondary pass matched:', relevantChunks.length);
      if (relevantChunks.length > 0) {
        console.log('[Vault][Debug] First secondary matched chunk:', relevantChunks[0].title, relevantChunks[0].content?.slice(0, 200));
      }
    }

    // 3. Fallback: split subTopic into words and search for any
    if (relevantChunks.length === 0) {
      const keywords = subTopic.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
      console.log('[Vault] Fallback keyword search:', keywords);
      relevantChunks = chunks.filter(chunk => {
        const content = chunk.content?.toLowerCase() || '';
        const title = chunk.title?.toLowerCase() || '';
        return keywords.some(word =>
          content.includes(word) ||
          title.includes(word)
        );
      });
      console.log('[Vault][Debug] Fallback search matched:', relevantChunks.length);
      if (relevantChunks.length > 0) {
        console.log('[Vault][Debug] First fallback matched chunk:', relevantChunks[0].title, relevantChunks[0].content?.slice(0, 200));
      }
    }

    // If still no relevant chunks, return the first 5 as a last resort
    if (relevantChunks.length === 0) {
      return chunks.slice(0, 5);
    }

    // Sort and return top 10
    return relevantChunks
      .sort((a, b) => this.calculateRelevanceScore(b, searchTerms) - this.calculateRelevanceScore(a, searchTerms))
      .slice(0, 10);
  }

  // Enhanced normalize search terms for better matching
  normalizeSearchTerms(searchTerm) {
    const normalized = searchTerm.toLowerCase().trim();
    let terms = [normalized];

    // Add synonyms and variations
    const variations = {
      'allegory of the cave': ['cave', 'allegory', 'plato', 'shadows', 'prisoners', 'republic', 'book vii'],
      'theory of forms': ['forms', 'ideas', 'plato', 'reality', 'universals'],
      'natural law': ['aquinas', 'law', 'nature', 'reason', 'morality'],
      'soul': ['psyche', 'spirit', 'mind', 'consciousness'],
      'teleological': ['teleology', 'design', 'purpose', 'goal'],
      'ontological': ['ontology', 'being', 'existence', 'necessary'],
      'cosmological': ['cosmology', 'cause', 'universe', 'first cause'],
      'moral': ['morality', 'ethics', 'good', 'evil', 'right', 'wrong'],
      'religious experience': ['experience', 'religious', 'mystical', 'spiritual'],
      'problem of evil': ['evil', 'suffering', 'pain', 'theodicy'],
      'free will': ['freedom', 'choice', 'determinism', 'libertarianism'],
      'afterlife': ['immortality', 'death', 'resurrection', 'heaven', 'hell'],
      'miracles': ['miracle', 'supernatural', 'divine intervention'],
      'prayer': ['prayer', 'worship', 'communication', 'divine'],
      'faith': ['faith', 'belief', 'trust', 'confidence'],
      'revelation': ['revelation', 'divine', 'disclosure', 'truth'],
      'scripture': ['scripture', 'bible', 'holy book', 'sacred text'],
      'church': ['church', 'community', 'fellowship', 'worship'],
      'sacraments': ['sacrament', 'baptism', 'eucharist', 'communion'],
      'atonement': ['atonement', 'redemption', 'salvation', 'forgiveness'],
      'incarnation': ['incarnation', 'jesus', 'christ', 'god-man'],
      'trinity': ['trinity', 'father', 'son', 'holy spirit', 'three-in-one']
    };
    for (const [key, synonyms] of Object.entries(variations)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        terms.push(...synonyms);
      }
    }
    // Add phrase splits and word-level terms
    terms.push(...normalized.split(/[^a-z0-9]+/).filter(w => w.length > 2));
    // Remove duplicates and return
    return [...new Set(terms)];
  }

  // Calculate relevance score for a chunk with improved scoring
  calculateRelevanceScore(chunk, searchTerms) {
    let score = 0;
    const content = chunk.content?.toLowerCase() || '';
    const title = chunk.title?.toLowerCase() || '';
    const subtopic = chunk.metadata?.subtopic?.toLowerCase() || '';
    
    // Score based on search term matches
    searchTerms.forEach(term => {
      // Content matches (highest weight)
      if (content.includes(term)) {
        score += 10;
        // Bonus for multiple occurrences
        const occurrences = (content.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(occurrences * 2, 10); // Cap at 10 bonus points
      }
      
      // Title matches (high weight)
      if (title.includes(term)) {
        score += 8;
      }
      
      // Subtopic matches (medium weight)
      if (subtopic.includes(term)) {
        score += 6;
      }
    });
    
    // Prefer core materials
    if (chunk.metadata?.type === 'core') {
      score += 5;
    }
    
    // Prefer longer, more substantial content
    if (content.length > 100) {
      score += 2;
    }
    
    // Prefer content with proper formatting (sentences, paragraphs)
    if (content.includes('.') && content.includes(' ')) {
      score += 1;
    }
    
    return score;
  }

  // Get exam-specific chunks
  getExamChunks(topic) {
    if (!this.isLoaded) return [];
    
    return this.vaultData.examBoard?.filter(chunk =>
      chunk.content?.toLowerCase().includes(topic.toLowerCase()) ||
      chunk.title?.toLowerCase().includes('exam') ||
      chunk.title?.toLowerCase().includes('paper')
    ) || [];
  }

  // Get revision chunks
  getRevisionChunks(topic, subTopic) {
    if (!this.isLoaded) return [];
    
    return this.vaultData.revisionEssays?.filter(chunk =>
      chunk.content?.toLowerCase().includes(subTopic.toLowerCase()) ||
      chunk.title?.toLowerCase().includes(topic.toLowerCase())
    ) || [];
  }

  // Get vault statistics
  getVaultStats() {
    if (!this.isLoaded) return null;
    
    const stats = {
      totalChunks: 0,
      byTopic: {},
      byType: {}
    };

    Object.entries(this.vaultData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        stats.totalChunks += value.length;
        stats.byType[key] = value.length;
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (Array.isArray(subValue)) {
            stats.totalChunks += subValue.length;
            stats.byTopic[key] = (stats.byTopic[key] || 0) + subValue.length;
            stats.byType[`${key}_${subKey}`] = subValue.length;
          }
        });
      }
    });

    return stats;
  }

  // Test function to verify data after loading
  testSearch() {
    if (!this.isLoaded) {
      console.warn('[Vault][Test] Vault not loaded yet');
      return;
    }
    const allChunks = [];
    Object.values(this.vaultData).forEach(val => {
      if (Array.isArray(val)) {
        allChunks.push(...val);
      } else if (typeof val === 'object') {
        Object.values(val).forEach(subval => {
          if (Array.isArray(subval)) allChunks.push(...subval);
        });
      }
    });
    console.log('[Vault][Test] Total chunks:', allChunks.length);
    const testWords = ['the', 'and', 'a', 'to', 'of'];
    testWords.forEach(word => {
      const matches = allChunks.filter(chunk =>
        chunk.content && chunk.content.toLowerCase().includes(word)
      );
      console.log(`[Vault][Test] Word "${word}" found in ${matches.length} chunks`);
    });
    const platoMatches = allChunks.filter(chunk =>
      chunk.content && chunk.content.toLowerCase().includes('plato')
    );
    console.log('[Vault][Test] Plato mentions:', platoMatches.length);
    if (platoMatches.length > 0) {
      console.log('[Vault][Test] First Plato match:', platoMatches[0].content.substring(0, 200));
    }
  }
}

// Create a singleton instance
export const vaultLoader = new VaultLoader(); 
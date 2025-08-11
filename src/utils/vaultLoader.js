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

  // Load all vault data dynamically via manifest
  async loadVault() {
    try {
      console.log('[Vault] Loading vault data via manifest...');

      // Fetch manifest generated under public/vault/manifest.json
      const manifestRes = await fetch('/vault/manifest.json');
      if (!manifestRes.ok) {
        console.warn('[Vault] No manifest.json found. Falling back to previous static loader.');
        // Back-compat: use old static structure as a last resort
        const fallback = await this.loadFolder('General');
        this.vaultData = { all: fallback };
        this.isLoaded = true;
        return this.vaultData;
      }
      const manifest = await manifestRes.json(); // array of relative paths like "PastPapers/File_chunks.json"

      // Fetch all files listed in manifest
      const allChunks = [];
      const results = await Promise.allSettled(
        manifest.map(async relPath => {
          const url = `/vault/${relPath}`;
          const res = await fetch(url);
          if (!res.ok) return [];
          const data = await res.json();
          // Derive folderPath and filename for conversion
          const lastSlash = relPath.lastIndexOf('/');
          const folderPath = lastSlash === -1 ? '' : relPath.substring(0, lastSlash);
          const filename = lastSlash === -1 ? relPath : relPath.substring(lastSlash + 1);
          return this.convertChunksFormat(data, folderPath, filename);
        })
      );

      results.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) allChunks.push(...r.value);
      });

      // Partition into types
      const pastPapers = allChunks.filter(c => (c.metadata?.type || '').toLowerCase().includes('past'));
      const textbooks = allChunks.filter(c => !(c.metadata?.type || '').toLowerCase().includes('past'));

      this.vaultData = {
        all: allChunks,
        textbooks,
        pastPapers
      };
      this.isLoaded = true;

      console.log('[Vault] Loaded chunks:', {
        total: allChunks.length,
        textbooks: textbooks.length,
        pastPapers: pastPapers.length
      });
      return this.vaultData;
    } catch (error) {
      console.error('[Vault] Error loading vault:', error);
      this.vaultData = { all: [] };
      this.isLoaded = true;
      return this.vaultData;
    }
  }

  // Legacy loadFolder kept for back-compat (used only if manifest missing)
  async loadFolder(folderPath) {
    try {
      const fullPath = `/vault/${folderPath}`;
      let knownFiles = [];
      if (folderPath === 'General') {
        knownFiles = ['sample_chunks.json'];
      }
      let allChunks = [];
      for (const filename of knownFiles) {
        try {
          const response = await fetch(`${fullPath}/${filename}`);
          if (response.ok) {
            const data = await response.json();
            const convertedChunks = this.convertChunksFormat(data, folderPath, filename);
            allChunks.push(...convertedChunks);
          }
        } catch (_) {}
      }
      if (allChunks.length > 0) return allChunks;
      // Fallback mock
      return [
        {
          id: `${folderPath}-1`,
          content: `Sample content from ${folderPath}. This would be actual text from your materials.`,
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
        content = String(chunk.content).trim();
        title = String(chunk.title).trim();
      } else if (chunk.text) {
        content = String(chunk.text).trim();
        title = this.extractTitleFromContent(chunk.text);
      }
      if (content && content.length > 2) {
        const pdfRelative = `${folderPath ? folderPath + '/' : ''}${filename.replace('_chunks.json', '.pdf')}`;
        const convertedChunk = {
          id: `${folderPath}-${filename}-${i}`,
          content,
          source: filename.replace('_chunks.json', '.pdf'),
          page,
          title,
          pdfUrl: `/vault/${pdfRelative}`,
          metadata: {
            topic: 'psychology',
            subtopic: this.extractSubtopicFromPath(folderPath || '', filename),
            type: this.extractTypeFromPath(folderPath || '')
          }
        };
        convertedChunks.push(convertedChunk);
      }
    }
    return convertedChunks;
  }

  // Extract subtopic from folder path and filename
  extractSubtopicFromPath(path, filename) {
    // Use filename (minus suffix) as a coarse subtopic, normalized
    const base = filename.replace('_chunks.json', '').toLowerCase();
    if (path.toLowerCase().includes('pastpapers')) return 'past papers';
    return base.replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Extract title from content
  extractTitleFromContent(content) {
    const lines = String(content).split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.length > 10 && line.length < 100 && !line.includes('•')) {
        return line.trim();
      }
    }
    return 'Untitled';
  }

  // Extract topic from folder path (default psychology for this app)
  extractTopicFromPath(path) {
    return 'psychology';
  }

  // Extract type from folder path (textbook vs past papers)
  extractTypeFromPath(path) {
    if (!path) return 'textbook';
    const lower = path.toLowerCase();
    if (lower.includes('pastpapers') || lower.includes('past papers')) return 'pastpaper';
    if (lower.includes('exam')) return 'exam';
    return 'textbook';
  }

  // Get relevant chunks for a topic and subtopic
  getRelevantChunks(topic, subTopic, includeAdditional = false) {
    if (!this.isLoaded) {
      console.warn('[Vault] Vault not loaded yet');
      return [];
    }

    // Aggregate all chunks across categories
    const chunks = [];
    Object.values(this.vaultData).forEach(val => {
      if (Array.isArray(val)) {
        chunks.push(...val);
      }
    });
    console.log('[Vault][Debug] Total chunks to search:', chunks.length);

    if (chunks.length === 0) {
      console.warn('[Vault] No chunks available');
      return [];
    }

    // Enhanced normalize search terms
    let searchTerms = this.normalizeSearchTerms(subTopic || topic || '');
    console.log('[Vault][Debug] Search terms:', searchTerms);

    // Main search: fuzzy/partial match in title, content, metadata
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

    // Secondary: starts-with or close match
    if (relevantChunks.length === 0 && searchTerms.length > 0) {
      relevantChunks = chunks.filter(chunk => {
        const content = chunk.content?.toLowerCase() || '';
        const title = chunk.title?.toLowerCase() || '';
        return searchTerms.some(term =>
          title.startsWith(term) ||
          content.startsWith(term) ||
          title.replace(/[^a-z0-9]/g, '').includes(term.replace(/[^a-z0-9]/g, ''))
        );
      });
    }

    // Fallback: word-level
    if (relevantChunks.length === 0 && subTopic) {
      const keywords = subTopic.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
      relevantChunks = chunks.filter(chunk => {
        const content = chunk.content?.toLowerCase() || '';
        const title = chunk.title?.toLowerCase() || '';
        return keywords.some(word => content.includes(word) || title.includes(word));
      });
    }

    if (relevantChunks.length === 0) return chunks.slice(0, 10);

    // Sort by relevance and return top 10
    return relevantChunks
      .sort((a, b) => this.calculateRelevanceScore(b, searchTerms) - this.calculateRelevanceScore(a, searchTerms))
      .slice(0, 10);
  }

  // Enhanced normalize search terms for better matching
  normalizeSearchTerms(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') return [];
    const normalized = searchTerm.toLowerCase().trim();
    let terms = [normalized];
    // Psychology-specific simple variations could be extended here
    terms.push(...normalized.split(/[^a-z0-9]+/).filter(w => w.length > 2));
    return [...new Set(terms)];
  }

  // Calculate relevance score for a chunk with improved scoring
  calculateRelevanceScore(chunk, searchTerms) {
    let score = 0;
    const content = chunk.content?.toLowerCase() || '';
    const title = chunk.title?.toLowerCase() || '';
    const subtopic = chunk.metadata?.subtopic?.toLowerCase() || '';

    searchTerms.forEach(term => {
      if (content.includes(term)) {
        score += 10;
        const occurrences = (content.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(occurrences * 2, 10);
      }
      if (title.includes(term)) score += 8;
      if (subtopic.includes(term)) score += 6;
    });

    // Prefer textbooks for general queries, boost past papers slightly for exam-ish terms
    if (chunk.metadata?.type === 'textbook') score += 2;
    if (chunk.metadata?.type === 'pastpaper') score += 1;
    if (content.length > 100) score += 1;
    if (content.includes('.') && content.includes(' ')) score += 1;

    return score;
  }

  // Get exam-specific chunks (past papers)
  getExamChunks(topic) {
    if (!this.isLoaded) return [];
    return this.vaultData.pastPapers || [];
  }

  // Get revision chunks (reuse textbooks for now)
  getRevisionChunks(topic, subTopic) {
    if (!this.isLoaded) return [];
    return (this.vaultData.textbooks || []).filter(chunk =>
      chunk.content?.toLowerCase().includes((subTopic || '').toLowerCase()) ||
      chunk.title?.toLowerCase().includes((topic || '').toLowerCase())
    );
  }

  // Get vault statistics
  getVaultStats() {
    if (!this.isLoaded) return null;
    const stats = { totalChunks: 0, byType: {} };
    Object.entries(this.vaultData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        stats.totalChunks += value.length;
        stats.byType[key] = value.length;
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
    const allChunks = this.vaultData.all || [];
    console.log('[Vault][Test] Total chunks:', allChunks.length);
    const testWords = ['the', 'and', 'study', 'psychology'];
    testWords.forEach(word => {
      const matches = allChunks.filter(chunk => chunk.content && chunk.content.toLowerCase().includes(word));
      console.log(`[Vault][Test] Word "${word}" found in ${matches.length} chunks`);
    });
  }
}

// Create a singleton instance
export const vaultLoader = new VaultLoader(); 
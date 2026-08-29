import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const storeFilePath = path.join(dataDir, 'vector_store.json');

class VectorStore {
  constructor() {
    this.chunks = []; // Array of chunk objects with embeddings
    this.isLoaded = false;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(storeFilePath)) {
        const raw = fs.readFileSync(storeFilePath, 'utf-8');
        this.chunks = JSON.parse(raw);
        console.log(`[VectorStore] Loaded ${this.chunks.length} chunks from storage.`);
      } else {
        this.chunks = [];
        this.persist();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('[VectorStore] Error initializing vector store:', err.message);
      this.chunks = [];
    }
  }

  persist() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(storeFilePath, JSON.stringify(this.chunks, null, 2), 'utf-8');
    } catch (err) {
      console.error('[VectorStore] Error persisting vector store:', err.message);
    }
  }

  /**
   * Adds chunks with their computed vector embeddings
   * @param {Array<Object>} chunksWithEmbeddings
   */
  async addChunks(chunksWithEmbeddings) {
    if (!chunksWithEmbeddings || chunksWithEmbeddings.length === 0) return 0;

    // Filter out existing identical chunk IDs to prevent duplicates
    const newIds = new Set(chunksWithEmbeddings.map((c) => c.id));
    this.chunks = this.chunks.filter((c) => !newIds.has(c.id));

    this.chunks.push(...chunksWithEmbeddings);
    this.persist();
    console.log(`[VectorStore] Added ${chunksWithEmbeddings.length} chunks. Total in store: ${this.chunks.length}`);
    return chunksWithEmbeddings.length;
  }

  /**
   * Cosine similarity between two numerical vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Similarity search for top-K matching chunks
   * @param {Array<number>} queryEmbedding
   * @param {number} topK
   * @param {Object} filter - e.g. { collegeId, category, documentId }
   * @returns {Array<Object>}
   */
  search(queryEmbedding, topK = 5, filter = {}) {
    if (this.chunks.length === 0) return [];

    let candidates = this.chunks;

    // Filter strictly by collegeId if provided
    if (filter.collegeId && filter.collegeId !== 'All') {
      candidates = candidates.filter((c) => (c.collegeId || 'saoe_pune') === filter.collegeId);
    }

    if (filter.category && filter.category !== 'All') {
      candidates = candidates.filter((c) => c.category === filter.category);
    }

    if (filter.documentId) {
      candidates = candidates.filter((c) => c.documentId === filter.documentId);
    }

    const scored = candidates.map((chunk) => {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        id: chunk.id,
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        collegeId: chunk.collegeId || 'saoe_pune',
        category: chunk.category,
        pageNumber: chunk.pageNumber || 1,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        score: Math.round(score * 1000) / 1000,
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  /**
   * Deletes all chunks associated with a document ID
   * @param {string} documentId
   */
  deleteByDocumentId(documentId) {
    const docIdStr = documentId.toString();
    const initialCount = this.chunks.length;
    this.chunks = this.chunks.filter((c) => c.documentId !== docIdStr);
    const removedCount = initialCount - this.chunks.length;
    this.persist();
    console.log(`[VectorStore] Removed ${removedCount} chunks for document: ${documentId}`);
    return removedCount;
  }

  /**
   * Deletes all chunks associated with a college ID
   * @param {string} collegeId
   */
  deleteByCollegeId(collegeId) {
    const initialCount = this.chunks.length;
    this.chunks = this.chunks.filter((c) => (c.collegeId || 'saoe_pune') !== collegeId);
    const removedCount = initialCount - this.chunks.length;
    this.persist();
    console.log(`[VectorStore] Removed ${removedCount} chunks for college: ${collegeId}`);
    return removedCount;
  }

  /**
   * Get store stats
   */
  getStats(collegeId = null) {
    let targetChunks = this.chunks;
    if (collegeId) {
      targetChunks = this.chunks.filter((c) => (c.collegeId || 'saoe_pune') === collegeId);
    }
    const uniqueDocs = new Set(targetChunks.map((c) => c.documentId));
    return {
      totalChunks: targetChunks.length,
      totalDocuments: uniqueDocs.size,
    };
  }

  /**
   * Clear entire vector store
   */
  clear() {
    this.chunks = [];
    this.persist();
  }
}

export const vectorStore = new VectorStore();

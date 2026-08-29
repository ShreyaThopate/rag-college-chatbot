import { generateEmbedding } from './embeddings.js';
import { vectorStore } from './vectorStore.js';
import { config } from '../config/env.js';

/**
 * Retrieves semantically relevant context chunks for a student question
 * @param {string} query - Student natural language question
 * @param {Object} options - { collegeId, topK, categoryFilter, documentId, threshold }
 * @returns {Promise<Array<Object>>}
 */
export const retrieveContext = async (query, options = {}) => {
  const topK = options.topK || config.topK || 5;
  const threshold = options.threshold !== undefined ? options.threshold : config.similarityThreshold;
  const collegeId = options.collegeId || 'saoe_pune';

  // 1. Generate vector embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search vector store with strict college filtering
  const matches = vectorStore.search(queryEmbedding, topK, {
    collegeId: collegeId,
    category: options.categoryFilter,
    documentId: options.documentId,
  });

  // 3. Filter by similarity threshold
  const relevantMatches = matches.filter((match) => match.score >= threshold);

  return relevantMatches;
};

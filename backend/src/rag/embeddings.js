import { config } from '../config/env.js';

let pipelineInstance = null;

/**
 * Initializes Xenova transformers feature extraction pipeline for SentenceTransformers
 */
const getPipeline = async () => {
  if (!pipelineInstance) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      console.log('[Embeddings] Loading SentenceTransformer embedding model (all-MiniLM-L6-v2)...');
      pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[Embeddings] SentenceTransformer model loaded successfully.');
    } catch (err) {
      console.warn('[Embeddings] Failed to load @xenova/transformers. Falling back to TF-IDF vectorizer:', err.message);
      pipelineInstance = null;
    }
  }
  return pipelineInstance;
};

/**
 * Generate dense vector embedding for a single text string
 * @param {string} text
 * @returns {Promise<Array<number>>}
 */
export const generateEmbedding = async (text) => {
  const cleanInput = text.replace(/\n/g, ' ').trim();
  if (!cleanInput) return new Array(384).fill(0);

  // 1. If configured to use Gemini API embeddings
  if (config.embeddingModel === 'gemini' && config.geminiApiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(cleanInput);
      return result.embedding.values;
    } catch (geminiErr) {
      console.warn('[Embeddings] Gemini embedding failed, falling back to local model:', geminiErr.message);
    }
  }

  // 2. Use local Xenova SentenceTransformer (all-MiniLM-L6-v2)
  try {
    const pipe = await getPipeline();
    if (pipe) {
      const output = await pipe(cleanInput, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
  } catch (pipeErr) {
    console.warn('[Embeddings] Local transformer error:', pipeErr.message);
  }

  // 3. Ultra-fast deterministic fallback vectorizer (384 dimensions)
  return generateDeterministicEmbedding(cleanInput, 384);
};

/**
 * Generate embeddings for multiple texts in batch
 * @param {Array<string>} texts
 * @returns {Promise<Array<Array<number>>>}
 */
export const generateEmbeddings = async (texts) => {
  const embeddings = [];
  for (const text of texts) {
    const emb = await generateEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
};

/**
 * Deterministic hash-based TF-IDF character & word n-gram vectorizer
 * Ensures cosine similarity still works even if model weights are unavailable
 */
export const generateDeterministicEmbedding = (text, dimensions = 384) => {
  const vec = new Array(dimensions).fill(0);
  const words = text.toLowerCase().match(/\b[a-z0-9_]+\b/g) || [];
  
  if (words.length === 0) return vec;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1;

    // Bigram
    if (i < words.length - 1) {
      const bigram = word + '_' + words[i + 1];
      let biHash = 0;
      for (let c = 0; c < bigram.length; c++) {
        biHash = ((biHash << 5) - biHash) + bigram.charCodeAt(c);
        biHash |= 0;
      }
      const biIdx = Math.abs(biHash) % dimensions;
      vec[biIdx] += 1.5;
    }
  }

  // Normalize to unit length for cosine similarity
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
};

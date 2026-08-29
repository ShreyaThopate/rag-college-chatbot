/**
 * Splits text into overlapping chunks using recursive separators (paragraphs, sentences, words).
 * Preserves document metadata and page numbers.
 */

const DEFAULT_CHUNK_SIZE = 600; // in approximate words/tokens
const DEFAULT_CHUNK_OVERLAP = 80;

/**
 * Approximate token count (1 token ≈ 4 characters in English, or ~0.75 words)
 */
export const countTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).length * 1.3);
};

/**
 * Splits a single string of text into chunks with overlap
 */
export const splitText = (text, maxTokens = DEFAULT_CHUNK_SIZE, overlapTokens = DEFAULT_CHUNK_OVERLAP) => {
  if (!text || text.trim().length === 0) return [];

  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = countTokens(para);

    if (paraTokens > maxTokens) {
      // Paragraph itself is larger than max chunk size: split by sentences
      const sentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [para];
      for (const sentence of sentences) {
        const sentenceTokens = countTokens(sentence);
        if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
          chunks.push(currentChunk.join(' ').trim());
          // Keep overlap from previous sentences
          const overlapWords = currentChunk.join(' ').split(/\s+/).slice(-overlapTokens);
          currentChunk = overlapWords.length > 0 ? [overlapWords.join(' ')] : [];
          currentTokens = countTokens(currentChunk.join(' '));
        }
        currentChunk.push(sentence.trim());
        currentTokens += sentenceTokens;
      }
    } else {
      if (currentTokens + paraTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n').trim());
        const overlapWords = currentChunk.join(' ').split(/\s+/).slice(-overlapTokens);
        currentChunk = overlapWords.length > 0 ? [overlapWords.join(' ')] : [];
        currentTokens = countTokens(currentChunk.join(' '));
      }
      currentChunk.push(para.trim());
      currentTokens += paraTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n').trim());
  }

  return chunks.filter((c) => c.length > 0);
};

/**
 * Chunks extracted document pages and attaches complete metadata
 * @param {Array<{ pageNumber: number, text: string }>} pages
 * @param {Object} metadata - { documentId, documentName, category }
 * @returns {Array<Object>}
 */
export const chunkDocument = (pages, metadata) => {
  const allChunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageTextChunks = splitText(page.text);

    for (let i = 0; i < pageTextChunks.length; i++) {
      const chunkText = pageTextChunks[i];
      if (chunkText.trim().length === 0) continue;

      allChunks.push({
        id: `${metadata.documentId}_chunk_${globalChunkIndex}`,
        documentId: metadata.documentId.toString(),
        documentName: metadata.documentName,
        collegeId: metadata.collegeId || 'saoe_pune',
        category: metadata.category || 'General',
        pageNumber: page.pageNumber || 1,
        chunkIndex: globalChunkIndex,
        text: chunkText,
        tokenCount: countTokens(chunkText),
      });

      globalChunkIndex++;
    }
  }

  return allChunks;
};

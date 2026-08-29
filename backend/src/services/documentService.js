import { Document } from '../models/Document.js';
import { loadDocument } from '../rag/loader.js';
import { chunkDocument } from '../rag/chunker.js';
import { generateEmbeddings } from '../rag/embeddings.js';
import { vectorStore } from '../rag/vectorStore.js';
import fs from 'fs/promises';

/**
 * Uploads a document and processes it through the RAG ingestion pipeline:
 * Validate -> Extract -> Chunk -> Embed -> Store in Vector DB -> Mark READY
 */
export const uploadAndProcessDocument = async ({ file, title, category, description, version, user, collegeId = 'saoe_pune' }) => {
  // 1. Create initial Document entry with UPLOADED status
  const document = await Document.create({
    title: title || file.originalname,
    fileName: file.originalname,
    collegeId: collegeId || 'saoe_pune',
    category: category || 'General',
    description: description || '',
    version: version || '1.0',
    uploadedBy: user._id,
    processingStatus: 'PROCESSING',
    fileSize: file.size,
    filePath: file.path,
  });

  // Run processing asynchronously so HTTP response is fast, or await if immediate
  processDocumentPipeline(document._id, file.path, file.originalname, {
    title: document.title,
    category: document.category,
    collegeId: document.collegeId,
  }).catch((err) => {
    console.error(`[DocumentService] Async processing failed for ${document._id}:`, err);
  });

  return document;
};

/**
 * Document processing worker pipeline
 */
export const processDocumentPipeline = async (documentId, filePath, originalName, meta = {}) => {
  try {
    console.log(`[DocumentService] Starting extraction for: ${originalName} (ID: ${documentId})`);
    
    // 1. Extract text page-by-page
    const pages = await loadDocument(filePath, originalName);
    console.log(`[DocumentService] Extracted ${pages.length} page(s) from ${originalName}`);

    // 2. Chunk text with college metadata
    const chunks = chunkDocument(pages, {
      documentId: documentId.toString(),
      documentName: originalName,
      collegeId: meta.collegeId || 'saoe_pune',
      category: meta.category || 'General',
    });
    console.log(`[DocumentService] Generated ${chunks.length} chunks for ${originalName}`);

    if (chunks.length === 0) {
      throw new Error('No searchable text chunks could be extracted from this document.');
    }

    // 3. Generate embeddings
    const chunkTexts = chunks.map((c) => c.text);
    console.log(`[DocumentService] Computing embeddings for ${chunks.length} chunks...`);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Combine chunks with their embeddings
    const chunksWithEmbeddings = chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: embeddings[idx],
    }));

    // 4. Store in vector database
    await vectorStore.addChunks(chunksWithEmbeddings);

    // 5. Update document status to READY
    const updated = await Document.findByIdAndUpdate(
      documentId,
      {
        processingStatus: 'READY',
        chunkCount: chunks.length,
        errorMessage: '',
      },
      { new: true }
    );

    console.log(`[DocumentService] Document ${originalName} is now READY with ${chunks.length} chunks.`);
    return updated;
  } catch (error) {
    console.error(`[DocumentService] Failed to process document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      processingStatus: 'FAILED',
      errorMessage: error.message,
    });
    throw error;
  }
};

/**
 * Get list of documents with optional filtering and search
 */
export const getDocuments = async ({ collegeId, category, status, search, page = 1, limit = 50 }) => {
  const query = {};

  if (collegeId && collegeId !== 'All') {
    query.collegeId = collegeId;
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  if (status && status !== 'All') {
    query.processingStatus = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);

  return {
    documents,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  };
};

/**
 * Get single document by ID
 */
export const getDocumentById = async (id) => {
  const doc = await Document.findById(id).populate('uploadedBy', 'name email');
  if (!doc) {
    const error = new Error('Document not found.');
    error.statusCode = 404;
    throw error;
  }
  return doc;
};

/**
 * Update document metadata
 */
export const updateDocument = async (id, updates) => {
  const allowed = ['title', 'category', 'description', 'version'];
  const updateData = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  const doc = await Document.findByIdAndUpdate(id, updateData, { new: true });
  if (!doc) {
    const error = new Error('Document not found.');
    error.statusCode = 404;
    throw error;
  }
  return doc;
};

/**
 * Deletes document record, removes physical file, and purges vectors from Vector Store
 */
export const deleteDocument = async (id) => {
  const doc = await Document.findById(id);
  if (!doc) {
    const error = new Error('Document not found.');
    error.statusCode = 404;
    throw error;
  }

  // 1. Purge from vector store
  vectorStore.deleteByDocumentId(doc._id);

  // 2. Remove physical uploaded file if exists
  if (doc.filePath) {
    try {
      await fs.unlink(doc.filePath);
    } catch (e) {
      console.warn(`[DocumentService] Could not remove file on disk: ${doc.filePath}`);
    }
  }

  // 3. Remove from MongoDB
  await Document.findByIdAndDelete(id);

  return { message: 'Document and all associated vector embeddings removed successfully.' };
};

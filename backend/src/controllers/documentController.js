import * as documentService from '../services/documentService.js';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a document file (PDF, DOCX, or TXT).' });
    }

    const { title, category, description, version, collegeId } = req.body;
    const document = await documentService.uploadAndProcessDocument({
      file: req.file,
      title: title || req.file.originalname,
      collegeId: collegeId || 'saoe_pune',
      category: category || 'General',
      description,
      version,
      user: req.user,
    });

    res.status(201).json({
      message: 'Document uploaded successfully and is currently being processed.',
      document,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const { collegeId, category, status, search, page, limit } = req.query;
    const result = await documentService.getDocuments({
      collegeId,
      category,
      status,
      search,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10),
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    res.status(200).json({ document });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body);
    res.status(200).json({ message: 'Document updated successfully.', document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

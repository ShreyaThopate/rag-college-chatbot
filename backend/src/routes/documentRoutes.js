import express from 'express';
import * as documentController from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public/Authenticated reading of documents
router.get('/', authenticate, documentController.getDocuments);
router.get('/:id', authenticate, documentController.getDocument);

// Admin-only document management
router.post('/', authenticate, requireAdmin, upload.single('file'), documentController.uploadDocument);
router.put('/:id', authenticate, requireAdmin, documentController.updateDocument);
router.delete('/:id', authenticate, requireAdmin, documentController.deleteDocument);

export default router;

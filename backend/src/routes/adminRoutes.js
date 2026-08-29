import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// Admin-only endpoints
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/documents', adminController.getAdminDocuments);

export default router;

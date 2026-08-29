import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All chat and conversation routes require authentication
router.use(authenticate);

router.post('/chat', chatController.postMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;

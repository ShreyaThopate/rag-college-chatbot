import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;

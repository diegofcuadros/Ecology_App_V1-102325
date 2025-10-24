import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getOrCreateChatSession,
  sendMessage,
} from '../controllers/chat.controller.js';

const router = Router();

router.use(authenticateToken);

router.get(
  '/session/:assignmentId',
  requireRole('student'),
  getOrCreateChatSession
);

router.post(
  '/message',
  requireRole('student'),
  sendMessage
);

export default router;

import express from 'express';
import { 
  getAllConversations, 
  createPrivateConversation, 
  createGroupConversation,
  getConversationById 
} from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All conversation routes require authentication
router.get('/', authMiddleware, getAllConversations);
router.post('/private', authMiddleware, createPrivateConversation);
router.post('/group', authMiddleware, createGroupConversation);
router.get('/:conversation_id', authMiddleware, getConversationById);

export default router;
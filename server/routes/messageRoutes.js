import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All message routes require authentication
router.get('/:conversation_id/messages', authMiddleware, getMessages);
router.post('/:conversation_id/messages', authMiddleware, (req, res) => {
  sendMessage(req, res, req.app.get('io'));
});

export default router;
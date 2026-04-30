import express from 'express';
import { getAllUsers, searchUsers, updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.get('/', authMiddleware, getAllUsers);
router.get('/search', authMiddleware, searchUsers);
router.patch('/me', authMiddleware, updateProfile);

export default router;

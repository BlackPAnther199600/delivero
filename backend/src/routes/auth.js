import express from 'express';
import { register, login, getCurrentUser, updatePushToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/push-token', authenticateToken, updatePushToken);

export default router;

import express from 'express';
import { createPayment, confirmOrderPayment, createCashPayment, markCashCollected } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authenticateToken, createPayment);
router.post('/confirm', authenticateToken, confirmOrderPayment);
router.post('/cash/create', authenticateToken, createCashPayment);
router.post('/cash/collected', authenticateToken, markCashCollected);

export default router;

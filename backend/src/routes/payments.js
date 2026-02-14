import express from 'express';
import { createPayment, confirmOrderPayment } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authenticateToken, createPayment);
router.post('/confirm', authenticateToken, confirmOrderPayment);

export default router;

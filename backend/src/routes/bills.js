import express from 'express';
import { getBills, addBill, deleteBill } from '../controllers/billsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getBills);
router.post('/', authenticateToken, addBill);
router.delete('/:id', authenticateToken, deleteBill);

export default router;

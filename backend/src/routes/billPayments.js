import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import * as billPaymentsController from '../controllers/billPaymentsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create bill payment request
router.post('/', authenticateToken, billPaymentsController.createBillPayment);

// Get user's bill payments
router.get('/user/payments', authenticateToken, billPaymentsController.getUserBillPayments);

// Get pending bill payments for rider
router.get('/rider/pending', authenticateToken, billPaymentsController.getPendingBillPayments);

// Get bill payment details
router.get('/:billPaymentId', authenticateToken, billPaymentsController.getBillPayment);

// Upload barcode/QR code images
router.post('/:billPaymentId/upload-images', 
  authenticateToken,
  upload.fields([{ name: 'barcode', maxCount: 1 }, { name: 'qrCode', maxCount: 1 }]),
  billPaymentsController.uploadBillPaymentImages
);

// Assign rider (admin only)
router.post('/:billPaymentId/assign-rider', authenticateToken, billPaymentsController.assignRider);

// Update payment status
router.patch('/:billPaymentId/status', authenticateToken, billPaymentsController.updatePaymentStatus);

// Add rider notes
router.post('/:billPaymentId/notes', authenticateToken, billPaymentsController.addNotes);

// Get statistics (admin only)
router.get('/admin/stats', authenticateToken, billPaymentsController.getStats);

export default router;

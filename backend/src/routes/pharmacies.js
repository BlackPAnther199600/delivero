import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import * as pharmacyController from '../controllers/pharmacyController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Pharmacy registration
router.post('/register', pharmacyController.registerPharmacy);

// Get all active pharmacies
router.get('/', pharmacyController.getPharmacies);

// Get pharmacy details
router.get('/:pharmacyId', pharmacyController.getPharmacy);

// Get pharmacy products
router.get('/:pharmacyId/products', pharmacyController.getPharmacyProducts);

// Add pharmacy product (pharmacy admin)
router.post('/:pharmacyId/products', 
  authenticateToken,
  upload.single('image'),
  pharmacyController.addProduct
);

// Create pharmacy order
router.post('/orders/create', authenticateToken, pharmacyController.createOrder);

// Get user orders
router.get('/orders/user/list', authenticateToken, pharmacyController.getUserOrders);

// Get pharmacy orders (pharmacy admin)
router.get('/:pharmacyId/orders', authenticateToken, pharmacyController.getPharmacyOrders);

// Get pending orders for riders
router.get('/orders/rider/pending', authenticateToken, pharmacyController.getPendingOrders);

// Assign rider to order
router.post('/orders/:orderId/assign-rider', authenticateToken, pharmacyController.assignRider);

// Update order status
router.patch('/orders/:orderId/status', authenticateToken, pharmacyController.updateOrderStatus);

// Verify pharmacy (admin only)
router.post('/:pharmacyId/verify', authenticateToken, pharmacyController.verifyPharmacy);

export default router;

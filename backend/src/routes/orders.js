import express from 'express';
import {
  getOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getAvailableOrders,
  acceptOrder,
  getActiveRiderOrders,
  completeDelivery,
  rateOrder,
  cancelOrder,
  trackOrder,
  getTrackHistory,
  updateRiderLocation,
  getActiveOrders
} from '../controllers/ordersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Manager endpoints (MUST come before /:id routes)
router.get('/active/all', authenticateToken, getActiveOrders);

// Rider endpoints (must come BEFORE /:id)
router.get('/available', authenticateToken, getAvailableOrders);
router.get('/rider/active', authenticateToken, getActiveRiderOrders);

// Customer endpoints
router.get('/', authenticateToken, getOrders);
router.get('/my', authenticateToken, getOrders); // Alias for getOrders
router.post('/', authenticateToken, createOrder);

// Order tracking and status (SPECIFY THESE BEFORE /:id)
router.get('/:id/track', authenticateToken, trackOrder);
router.get('/:id/track-history', authenticateToken, getTrackHistory);
router.post('/:id/location', authenticateToken, updateRiderLocation);

// Generic order endpoints (these come AFTER specific ones)
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/status', authenticateToken, updateOrderStatus);
router.put('/:id/cancel', authenticateToken, cancelOrder);
router.put('/:id/accept', authenticateToken, acceptOrder);
router.post('/:id/rate', authenticateToken, rateOrder);
router.put('/:id/delivered', authenticateToken, completeDelivery);

export default router;

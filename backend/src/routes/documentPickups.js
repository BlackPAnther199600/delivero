import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as documentPickupController from '../controllers/documentPickupController.js';

const router = express.Router();

// Create document pickup request
router.post('/', authenticateToken, documentPickupController.createPickup);

// Get user pickups
router.get('/user/list', authenticateToken, documentPickupController.getUserPickups);

// Get pending pickups for riders
router.get('/rider/pending', authenticateToken, documentPickupController.getPendingPickups);

// Get rider active pickups
router.get('/rider/active', authenticateToken, documentPickupController.getRiderActivePickups);

// Track pickup by tracking number (public access)
router.get('/track/:trackingNumber', documentPickupController.trackPickup);

// Get pickup details
router.get('/:pickupId', authenticateToken, documentPickupController.getPickup);

// Assign rider (admin only)
router.post('/:pickupId/assign-rider', authenticateToken, documentPickupController.assignRider);

// Update pickup status
router.patch('/:pickupId/status', authenticateToken, documentPickupController.updateStatus);

// Get statistics (admin only)
router.get('/admin/stats', authenticateToken, documentPickupController.getStats);

// Get document type statistics (admin only)
router.get('/admin/document-types', authenticateToken, documentPickupController.getDocumentTypeStats);

export default router;

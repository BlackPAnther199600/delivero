import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as medicalTransportController from '../controllers/medicalTransportController.js';

const router = express.Router();

// Create medical transport request
router.post('/', authenticateToken, medicalTransportController.createTransport);

// Get user transports
router.get('/user/list', authenticateToken, medicalTransportController.getUserTransports);

// Get pending transports for riders
router.get('/rider/pending', authenticateToken, medicalTransportController.getPendingTransports);

// Get upcoming appointments
router.get('/appointments/upcoming', medicalTransportController.getUpcomingAppointments);

// Get transport details
router.get('/:transportId', authenticateToken, medicalTransportController.getTransport);

// Assign rider (admin only)
router.post('/:transportId/assign-rider', authenticateToken, medicalTransportController.assignRider);

// Rider confirm transport
router.patch('/:transportId/confirm', authenticateToken, medicalTransportController.confirmTransport);

// Update transport status
router.patch('/:transportId/status', authenticateToken, medicalTransportController.updateStatus);

// Update transport cost
router.patch('/:transportId/cost', authenticateToken, medicalTransportController.updateCost);

// Add notes
router.post('/:transportId/notes', authenticateToken, medicalTransportController.addNotes);

// Get statistics (admin only)
router.get('/admin/stats', authenticateToken, medicalTransportController.getStats);

export default router;

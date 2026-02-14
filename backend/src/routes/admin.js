import express from 'express';
import { 
  getAdminStats, 
  getAllOrders, 
  getAllUsers, 
  updateUserRole,
  deleteUser,
  getFinanceReport,
  getServiceMetrics,
  getTicketStats
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Require authentication
router.use(authenticateToken);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.get('/finance', getFinanceReport);
router.get('/metrics', getServiceMetrics);
router.get('/tickets/stats', getTicketStats);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

export default router;

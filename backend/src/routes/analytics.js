import express from 'express';
import AnalyticsService from '../services/analytics.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Apply caching to analytics routes
router.use(cacheMiddleware(600)); // 10 minutes cache

// Track event
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { eventType, data } = req.body;
    await AnalyticsService.trackEvent(eventType, req.user.userId, data);
    res.json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track event', error: error.message });
  }
});

// Get user metrics
router.get('/user/:userId/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own metrics or admins
    if (req.user.userId !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const metrics = await AnalyticsService.getUserMetrics(userId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user metrics', error: error.message });
  }
});

// Get event stats
router.get('/events/:eventType/stats', authenticateToken, async (req, res) => {
  try {
    const { eventType } = req.params;
    const { timeRange = '24h' } = req.query;
    
    const stats = await AnalyticsService.getEventStats(eventType, timeRange);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get event stats', error: error.message });
  }
});

// Get popular restaurants
router.get('/restaurants/popular', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popular = await AnalyticsService.getPopularRestaurants(parseInt(limit));
    res.json(popular);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get popular restaurants', error: error.message });
  }
});

// Get real-time metrics
router.get('/realtime', authenticateToken, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    const metrics = await AnalyticsService.getRealTimeMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get real-time metrics', error: error.message });
  }
});

// Get dashboard analytics
router.get('/dashboard', authenticateToken, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Get various metrics for dashboard
    const [
      orderStats,
      userStats,
      restaurantStats,
      revenueStats
    ] = await Promise.all([
      AnalyticsService.getEventStats('order_created', timeRange),
      AnalyticsService.getEventStats('user_login', timeRange),
      AnalyticsService.getEventStats('restaurant_view', timeRange),
      AnalyticsService.getEventStats('order_created', timeRange)
    ]);
    
    res.json({
      orders: orderStats,
      users: userStats,
      restaurants: restaurantStats,
      revenue: revenueStats,
      timeRange
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard analytics', error: error.message });
  }
});

export default router;

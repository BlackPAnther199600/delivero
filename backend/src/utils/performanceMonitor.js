import os from 'os';
import { performance } from 'perf_hooks';

class PerformanceMonitor {
  static getMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      cpu: {
        user: Math.round(cpuUsage.user * 100),
        system: Math.round(cpuUsage.system * 100),
        idle: Math.round(cpuUsage.idle * 100)
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  static logPerformanceMetrics() {
    const metrics = this.getMetrics();
    console.log('Performance Metrics:', {
      timestamp: metrics.timestamp,
      memory: metrics.memory,
      cpu: metrics.cpu,
      uptime: metrics.uptime
    });
  }

  static async getDatabaseMetrics() {
    try {
      const db = require('../config/db.js').default;
      
      // Get connection count
      const connectionCount = await db.query('SELECT count(*) FROM pg_stat_activity WHERE state = \'active\'');
      
      // Get slow queries
      const slowQueries = await db.query(`
        SELECT query, mean_time, calls, total_time
        FROM pg_stat_statements 
        WHERE mean_time > 1000 
        ORDER BY mean_time DESC 
        LIMIT 10
      `);
      
      // Get table sizes
      const tableSizes = await db.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins,
          n_live_tup,
          n_dead_tup
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC
      `);
      
      return {
        connections: connectionCount.rows[0]?.count || 0,
        slowQueries: slowQueries.rows,
        tableSizes: tableSizes.rows
      };
    } catch (error) {
      console.error('Failed to get database metrics:', error);
      return {};
    }
  }

  static async getApiMetrics() {
    try {
      const db = require('../config/db.js').default;
      
      // Get API call statistics
      const apiStats = await db.query(`
        SELECT 
          COUNT(*) as total_requests,
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests,
          COUNT(CASE WHEN status_code >= 500 THEN 1 END) as server_errors
        FROM api_logs 
        WHERE created_at >= NOW() - INTERVAL 1 hour
      `);
      
      return {
        totalRequests: apiStats.rows[0]?.total_requests || 0,
        avgResponseTime: Math.round(apiStats.rows[0]?.avg_response_time || 0),
        errorRate: Math.round((apiStats.rows[0]?.error_requests || 0) / (apiStats.rows[0]?.total_requests || 1)) * 100),
        serverErrors: apiStats.rows[0]?.server_errors || 0
      };
    } catch (error) {
      console.error('Failed to get API metrics:', error);
      return {};
    }
  }

  static async getCacheMetrics() {
    try {
      const cache = require('../middleware/cache.js').default;
      const stats = cache.getStats();
      
      return {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: Math.round((stats.hits / (stats.hits + stats.misses)) * 100),
        ksize: stats.ksize,
        memoryUsage: process.memoryUsage().heapUsed
      };
    } catch (error) {
      console.error('Failed to get cache metrics:', error);
      return {};
    }
  }
}

export default PerformanceMonitor;

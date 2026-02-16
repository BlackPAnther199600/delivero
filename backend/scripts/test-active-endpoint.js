#!/usr/bin/env node
// Test the /orders/active/all endpoint directly
import db from '../src/config/db.js';

(async () => {
  try {
    console.log('Testing /orders/active/all endpoint response...');
    
    // This is the exact query from ordersController.js
    const result = await db.query(`
      SELECT 
        o.id,
        o.status,
        o.rider_id,
        o.rider_latitude,
        o.rider_longitude,
        o.eta_minutes,
        o.delivery_address,
        o.total_amount,
        u.name as rider_name,
        u.email as rider_email
      FROM orders o
      LEFT JOIN users u ON o.rider_id = u.id
      WHERE o.status IN ('accepted', 'pickup', 'in_transit')
      ORDER BY o.created_at DESC
    `);
    
    console.log('Raw query result rows:', result.rows.length);
    console.table(result.rows);
    
    // Simulate the response format
    const response = result.rows;
    console.log('Response that would be sent to mobile:', JSON.stringify(response, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e?.message || e);
    process.exit(1);
  }
})();

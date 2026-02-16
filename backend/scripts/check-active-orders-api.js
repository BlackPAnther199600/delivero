#!/usr/bin/env node
import db from '../src/config/db.js';

(async () => {
  try {
    console.log('Testing /orders/active/all endpoint logic...');
    
    // Simulate the query from ordersController.js
    const res = await db.query(`
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
    
    console.log('Active orders found:', res.rows.length);
    console.table(res.rows);
    
    // Check which orders have valid coordinates
    const withCoords = res.rows.filter(o => 
      o.rider_latitude && o.rider_longitude && 
      !isNaN(parseFloat(o.rider_latitude)) && 
      !isNaN(parseFloat(o.rider_longitude))
    );
    
    console.log('Orders with valid coordinates:', withCoords.length);
    console.table(withCoords);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e?.message || e);
    process.exit(1);
  }
})();

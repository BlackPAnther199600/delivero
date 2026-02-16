#!/usr/bin/env node
import db from '../src/config/db.js';

(async () => {
  try {
    console.log('Checking orders with rider coordinates...');
    
    const res = await db.query(`
      SELECT 
        id, 
        status, 
        rider_id, 
        rider_latitude, 
        rider_longitude, 
        eta_minutes,
        delivery_address,
        total_amount
      FROM orders 
      WHERE rider_latitude IS NOT NULL AND rider_longitude IS NOT NULL
      ORDER BY id DESC
      LIMIT 5
    `);
    
    console.log('Orders with rider coords:', res.rows.length);
    console.table(res.rows);
    
    if (res.rows.length === 0) {
      console.log('No orders with rider coordinates found.');
      console.log('Checking all orders...');
      const allRes = await db.query(`
        SELECT id, status, rider_id, rider_latitude, rider_longitude, eta_minutes 
        FROM orders 
        ORDER BY id DESC 
        LIMIT 5
      `);
      console.table(allRes.rows);
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e?.message || e);
    process.exit(1);
  }
})();

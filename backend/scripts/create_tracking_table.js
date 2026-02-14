#!/usr/bin/env node
import db from '../src/config/db.js';

(async () => {
  try {
    console.log('Creating order_tracks table if not exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_tracks (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Table ensured.');
    process.exit(0);
  } catch (e) {
    console.error('Error creating table:', e.message);
    process.exit(1);
  }
})();

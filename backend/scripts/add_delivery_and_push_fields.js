#!/usr/bin/env node
import db from '../src/config/db.js';

(async () => {
    try {
        console.log('Altering orders and users tables to add delivery coords and push token...');
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10,8);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11,8);`);
        console.log('Columns ensured.');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
})();

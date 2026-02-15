// Initialize restaurants database tables
// Run: node scripts/init-restaurants.js

const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function initRestaurantsTables() {
    try {
        console.log('📦 Initializing restaurants tables...');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'create_restaurants_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await pool.query(sql);

        console.log('✅ Restaurants tables initialized successfully!');

        // Verify tables
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('restaurants', 'menu_items', 'menu_categories', 'menu_customizations', 'reviews', 'user_points')
    `);

        console.log('📊 Created tables:');
        tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing restaurants tables:', error.message);
        process.exit(1);
    }
}

initRestaurantsTables();

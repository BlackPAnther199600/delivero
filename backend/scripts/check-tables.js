import db from '../src/config/db.js';

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Check restaurants table
    const restaurantsCheck = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      ORDER BY ordinal_position
    `);
    
    console.log('Restaurants table columns:');
    restaurantsCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if restaurant_categories exists
    try {
      const categoriesCheck = await db.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'restaurant_categories'
      `);
      console.log(`Restaurant categories table exists: ${categoriesCheck.rows[0].count > 0 ? 'YES' : 'NO'}`);
    } catch (e) {
      console.log('Restaurant categories table: NO (error)', e.message);
    }
    
    // Check if menu_items exists
    try {
      const menuItemsCheck = await db.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'menu_items'
      `);
      console.log(`Menu items table exists: ${menuItemsCheck.rows[0].count > 0 ? 'YES' : 'NO'}`);
    } catch (e) {
      console.log('Menu items table: NO (error)', e.message);
    }
    
    // Check if reviews exists
    try {
      const reviewsCheck = await db.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'reviews'
      `);
      console.log(`Reviews table exists: ${reviewsCheck.rows[0].count > 0 ? 'YES' : 'NO'}`);
    } catch (e) {
      console.log('Reviews table: NO (error)', e.message);
    }
    
    // Check sample data
    const restaurantCount = await db.query('SELECT COUNT(*) as count FROM restaurants');
    console.log(`Restaurants in database: ${restaurantCount.rows[0].count}`);
    
    const categoriesCount = await db.query('SELECT COUNT(*) as count FROM restaurant_categories');
    console.log(`Restaurant categories in database: ${categoriesCount.rows[0].count}`);
    
    const menuItemsCount = await db.query('SELECT COUNT(*) as count FROM menu_items');
    console.log(`Menu items in database: ${menuItemsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await db.end();
  }
}

checkTables();

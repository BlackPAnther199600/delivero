import db from '../src/config/db.js';

const menuItems = [
  // Sushi Master (id: 3) - Categories
  { restaurant_id: 3, name: 'Sushi', display_order: 1 },
  { restaurant_id: 3, name: 'Sashimi', display_order: 2 },
  { restaurant_id: 3, name: 'Rolls', display_order: 3 },
  
  // Pizza Paradise (id: 10) - Categories  
  { restaurant_id: 10, name: 'Pizza Classica', display_order: 1 },
  { restaurant_id: 10, name: 'Pizza Speciale', display_order: 2 },
  { restaurant_id: 10, name: 'Antipasti', display_order: 3 },
  
  // Pizzeria Roma (id: 1) - Categories
  { restaurant_id: 1, name: 'Pizza Classica', display_order: 1 },
  { restaurant_id: 1, name: 'Pizza Speciale', display_order: 2 },
  { restaurant_id: 1, name: 'Antipasti', display_order: 3 },
  
  // Burger House (id: 2) - Categories
  { restaurant_id: 2, name: 'Burger', display_order: 1 },
  { restaurant_id: 2, name: 'Sides', display_order: 2 },
  { restaurant_id: 2, name: 'Beverages', display_order: 3 },
];

const items = [
  // Sushi Master items
  { restaurant_id: 3, category_id: 1, name: 'Salmon Nigiri', description: 'Fresh salmon over sushi rice', price: 4.50 },
  { restaurant_id: 3, category_id: 1, name: 'Tuna Nigiri', description: 'Fresh tuna over sushi rice', price: 5.00 },
  { restaurant_id: 3, category_id: 2, name: 'Salmon Sashimi', description: '6 pieces of fresh salmon', price: 12.00 },
  { restaurant_id: 3, category_id: 3, name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.50 },
  
  // Pizza Paradise items
  { restaurant_id: 10, category_id: 1, name: 'Margherita', description: 'Tomato, mozzarella, basil', price: 7.00 },
  { restaurant_id: 10, category_id: 1, name: 'Marinara', description: 'Tomato, garlic, oregano', price: 6.50 },
  { restaurant_id: 10, category_id: 2, name: 'Quattro Stagioni', description: 'Tomato, mozzarella, ham, mushrooms, artichokes', price: 10.00 },
  
  // Pizzeria Roma items
  { restaurant_id: 1, category_id: 1, name: 'Margherita', description: 'Tomato, mozzarella, basil', price: 6.50 },
  { restaurant_id: 1, category_id: 1, name: 'Diavola', description: 'Tomato, mozzarella, spicy salami', price: 8.00 },
  { restaurant_id: 1, category_id: 2, name: 'Quattro Formaggi', description: 'Tomato, mozzarella, gorgonzola, parmesan', price: 9.00 },
  
  // Burger House items
  { restaurant_id: 2, category_id: 1, name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion', price: 8.50 },
  { restaurant_id: 2, category_id: 1, name: 'Cheese Burger', description: 'Beef patty, cheddar, lettuce, tomato', price: 9.00 },
  { restaurant_id: 2, category_id: 2, name: 'French Fries', description: 'Crispy golden fries', price: 3.50 },
];

async function seedMenuItems() {
  try {
    console.log('Seeding menu categories and items...');
    
    // Get existing categories to map IDs
    const existingCategories = await db.query(
      'SELECT id, restaurant_id, name FROM restaurant_categories WHERE is_active = true'
    );
    
    const categoryMap = {};
    existingCategories.rows.forEach(cat => {
      const key = `${cat.restaurant_id}-${cat.name}`;
      categoryMap[key] = cat.id;
    });
    
    // Insert categories
    for (const category of menuItems) {
      try {
        const result = await db.query(`
          INSERT INTO restaurant_categories (restaurant_id, name, display_order)
          VALUES ($1, $2, $3)
          ON CONFLICT (restaurant_id, name) DO UPDATE SET
            display_order = EXCLUDED.display_order,
            is_active = true
          RETURNING id
        `, [category.restaurant_id, category.name, category.display_order]);
        
        const key = `${category.restaurant_id}-${category.name}`;
        categoryMap[key] = result.rows[0].id;
      } catch (error) {
        console.log('Category already exists:', category.name);
      }
    }
    
    // Insert menu items
    for (const item of items) {
      const categoryKey = `${item.restaurant_id}-${item.category_id}`;
      const actualCategoryId = categoryMap[categoryKey] || categoryMap[`${item.restaurant_id}-${item.name}`];
      
      if (actualCategoryId) {
        await db.query(`
          INSERT INTO menu_items (restaurant_id, category_id, name, description, price)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [item.restaurant_id, actualCategoryId, item.name, item.description, item.price]);
      }
    }
    
    console.log('Menu items seeded successfully!');
  } catch (error) {
    console.error('Error seeding menu items:', error);
  } finally {
    await db.end();
  }
}

seedMenuItems();

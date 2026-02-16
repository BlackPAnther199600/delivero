import db from '../src/config/db.js';

const restaurants = [
  {
    name: 'Sushi Master',
    description: 'Fresh Japanese sushi and sashimi delivered to your door',
    address: 'Via Roma 123, Milano',
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    phone: '+39 02 123456',
    website: 'https://sushimaster.it',
    latitude: 45.4642,
    longitude: 9.1900,
    is_open: true,
    estimated_delivery_time: 30,
    delivery_cost: 2.00
  },
  {
    name: 'Pizza Paradise',
    description: 'Authentic Neapolitan pizza with fresh ingredients',
    address: 'Via Napoli 45, Milano',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    phone: '+39 02 234567',
    website: 'https://pizzaparadise.it',
    latitude: 45.4642,
    longitude: 9.1900,
    is_open: true,
    estimated_delivery_time: 25,
    delivery_cost: 1.50
  },
  {
    name: 'Burger House',
    description: 'Gourmet burgers and American comfort food',
    address: 'Via Washington 78, Milano',
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23e988658f4e',
    phone: '+39 02 345678',
    website: 'https://burgerhouse.it',
    latitude: 45.4642,
    longitude: 9.1900,
    is_open: true,
    estimated_delivery_time: 20,
    delivery_cost: 2.50
  }
];

const categories = [
  { restaurant_id: 1, name: 'Sushi', display_order: 1 },
  { restaurant_id: 1, name: 'Sashimi', display_order: 2 },
  { restaurant_id: 1, name: 'Rolls', display_order: 3 },
  { restaurant_id: 2, name: 'Pizza Classica', display_order: 1 },
  { restaurant_id: 2, name: 'Pizza Speciale', display_order: 2 },
  { restaurant_id: 2, name: 'Antipasti', display_order: 3 },
  { restaurant_id: 3, name: 'Burger', display_order: 1 },
  { restaurant_id: 3, name: 'Sides', display_order: 2 },
  { restaurant_id: 3, name: 'Beverages', display_order: 3 }
];

const menuItems = [
  // Sushi Master items
  { restaurant_id: 1, category_id: 1, name: 'Salmon Nigiri', description: 'Fresh salmon over sushi rice', price: 4.50 },
  { restaurant_id: 1, category_id: 1, name: 'Tuna Nigiri', description: 'Fresh tuna over sushi rice', price: 5.00 },
  { restaurant_id: 1, category_id: 2, name: 'Salmon Sashimi', description: '6 pieces of fresh salmon', price: 12.00 },
  { restaurant_id: 1, category_id: 3, name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.50 },
  
  // Pizza Paradise items
  { restaurant_id: 2, category_id: 1, name: 'Margherita', description: 'Tomato, mozzarella, basil', price: 7.00 },
  { restaurant_id: 2, category_id: 1, name: 'Marinara', description: 'Tomato, garlic, oregano', price: 6.50 },
  { restaurant_id: 2, category_id: 2, name: 'Quattro Stagioni', description: 'Tomato, mozzarella, ham, mushrooms, artichokes', price: 10.00 },
  
  // Burger House items
  { restaurant_id: 3, category_id: 1, name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion', price: 8.50 },
  { restaurant_id: 3, category_id: 1, name: 'Cheese Burger', description: 'Beef patty, cheddar, lettuce, tomato', price: 9.00 },
  { restaurant_id: 3, category_id: 2, name: 'French Fries', description: 'Crispy golden fries', price: 3.50 }
];

async function seedRestaurants() {
  try {
    console.log('Seeding restaurants...');
    
    // Insert restaurants
    for (const restaurant of restaurants) {
      await db.query(`
        INSERT INTO restaurants (name, description, address, rating, image_url, phone, website, latitude, longitude, is_open, estimated_delivery_time, delivery_cost)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING
      `, [
        restaurant.name, restaurant.description, restaurant.address, restaurant.rating,
        restaurant.image_url, restaurant.phone, restaurant.website, restaurant.latitude,
        restaurant.longitude, restaurant.is_open, restaurant.estimated_delivery_time, restaurant.delivery_cost
      ]);
    }
    
    // Insert categories
    for (const category of categories) {
      await db.query(`
        INSERT INTO restaurant_categories (restaurant_id, name, display_order)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [category.restaurant_id, category.name, category.display_order]);
    }
    
    // Insert menu items
    for (const item of menuItems) {
      await db.query(`
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [item.restaurant_id, item.category_id, item.name, item.description, item.price]);
    }
    
    console.log('Restaurants seeded successfully!');
  } catch (error) {
    console.error('Error seeding restaurants:', error);
  } finally {
    await db.end();
  }
}

seedRestaurants();

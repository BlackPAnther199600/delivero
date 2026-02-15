-- Create restaurants and discovery tables
-- Run this script on Supabase SQL editor to initialize the discovery/restaurant system

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 4.0,
  estimated_delivery_time INTEGER DEFAULT 30, -- minutes
  delivery_cost DECIMAL(5,2) DEFAULT 2.00,
  address TEXT,
  phone VARCHAR(20),
  website VARCHAR(255),
  image_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_open BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurant_categories (food categories)
CREATE TABLE IF NOT EXISTS restaurant_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items (products) table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES restaurant_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  allergens JSONB, -- JSON array of allergen strings
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_customizations table (toppings, size, etc.)
CREATE TABLE IF NOT EXISTS menu_customizations (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'radio', 'checkbox', 'text'
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  comment TEXT,
  photos JSONB, -- Array of image URLs
  is_verified BOOLEAN DEFAULT false, -- Verified purchase (order.status = 'delivered' and within 48h)
  gamification_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_points table for gamification
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  last_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_desc ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON restaurant_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);

-- Insert test data (optional - comment out if not needed)
INSERT INTO restaurants (
  name, description, rating, estimated_delivery_time, delivery_cost, 
  address, phone, image_url, is_active
) VALUES
  ('Pizzeria Roma', 'Autentica pizzeria napoletana con forno a legna', 4.8, 25, 2.50, 'Via Roma 123, Milano', '+39 02 1234567', 'https://via.placeholder.com/pizza1.jpg', true),
  ('Burger House', 'Gourmet burger restaurant con carne selezionata', 4.6, 15, 1.50, 'Via Burger 456, Milano', '+39 02 2345678', 'https://via.placeholder.com/burger1.jpg', true),
  ('Sushi Master', 'Fresh Japanese sushi bar con chef giapponese', 4.9, 30, 3.00, 'Via Sushi 789, Milano', '+39 02 3456789', 'https://via.placeholder.com/sushi1.jpg', true),
  ('Poke Bowl', 'Hawaii poke restaurant con ingredienti fresh', 4.7, 15, 1.00, 'Via Poke 101, Milano', '+39 02 4567890', 'https://via.placeholder.com/poke1.jpg', true),
  ('Kebab Palace', 'Middle Eastern kebab specializzato in carni grigliate', 4.5, 10, 0.80, 'Via Kebab 202, Milano', '+39 02 5678901', 'https://via.placeholder.com/kebab1.jpg', true)
ON CONFLICT DO NOTHING;

-- Create categories for Pizzeria Roma (id=1)
INSERT INTO restaurant_categories (restaurant_id, name, description, display_order, is_active) VALUES
  (1, 'Classiche', 'Pizze tradizionali napoletane', 1, true),
  (1, 'Speciali', 'Pizze della casa', 2, true),
  (1, 'Bevande', 'Bibite e vini', 3, true)
ON CONFLICT DO NOTHING;

-- Create menu items for Pizzeria Roma
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_active) VALUES
  (1, 1, 'Margherita', 'Pomodoro, mozzarella, basilico', 8.50, true),
  (1, 1, 'Quattro Formaggi', 'Mozzarella, gorgonzola, pecorino, parmigiano', 10.50, true),
  (1, 2, 'Romeo & Giulietta', 'Speck, rucola, parmigiano', 12.00, true)
ON CONFLICT DO NOTHING;

-- Enable RLS and create policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Restaurants are viewable by everyone" 
  ON restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Menu items are viewable by everyone" 
  ON menu_items FOR SELECT USING (is_active = true);
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT USING (true);

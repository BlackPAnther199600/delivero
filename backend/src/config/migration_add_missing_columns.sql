-- ========================================
-- MIGRATION SCRIPT - ADD MISSING COLUMNS
-- PostgreSQL - Safe for multiple runs
-- ========================================
-- This script adds missing columns to existing tables

-- ========================================
-- 1. ADD MISSING COLUMNS TO ORDERS TABLE
-- ========================================

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS rider_id INTEGER REFERENCES users(id);

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS rider_latitude DECIMAL(10, 8);

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS rider_longitude DECIMAL(11, 8);

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMP;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;

-- ========================================
-- 2. ADD MISSING COLUMNS TO RESTAURANTS TABLE
-- ========================================

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS estimated_delivery_time INTEGER DEFAULT 30;

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS delivery_cost DECIMAL(5, 2) DEFAULT 2.00;

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- 3. CREATE MISSING TABLES
-- ========================================

-- Create restaurant_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS restaurant_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES restaurant_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  allergens JSONB,
  is_available BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_customizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_customizations (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  comment TEXT,
  photos JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  gamification_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_points table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  last_review_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create bill_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS bill_payments (
  id SERIAL PRIMARY KEY,
  bill_id INTEGER NOT NULL REFERENCES bills(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  rider_id INTEGER REFERENCES users(id),
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  barcode_image_url VARCHAR(500),
  qr_code_image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  rider_payment_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pharmacies table if it doesn't exist
CREATE TABLE IF NOT EXISTS pharmacies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  license_number VARCHAR(100) UNIQUE NOT NULL,
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pharmacy_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS pharmacy_products (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pharmacy_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id),
  rider_id INTEGER REFERENCES users(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address VARCHAR(500),
  delivery_lat DECIMAL(10, 8),
  delivery_lon DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'pending',
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_transports table if it doesn't exist
CREATE TABLE IF NOT EXISTS medical_transports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  rider_id INTEGER REFERENCES users(id),
  doctor_name VARCHAR(255) NOT NULL,
  clinic_name VARCHAR(255),
  clinic_address VARCHAR(500) NOT NULL,
  clinic_phone VARCHAR(20),
  pickup_address VARCHAR(500) NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lon DECIMAL(11, 8),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  return_trip BOOLEAN DEFAULT TRUE,
  special_requirements TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document_pickups table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_pickups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  rider_id INTEGER REFERENCES users(id),
  document_type VARCHAR(100) NOT NULL,
  pickup_location VARCHAR(500) NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lon DECIMAL(11, 8),
  delivery_address VARCHAR(500),
  delivery_lat DECIMAL(10, 8),
  delivery_lon DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'pending',
  estimated_cost DECIMAL(10, 2),
  description TEXT,
  tracking_number VARCHAR(255) UNIQUE,
  signature_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_urls JSONB,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ticket_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. CREATE/UPDATE INDEXES
-- ========================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Bills indexes
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_id);

-- Bill Payments indexes
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_rider_id ON bill_payments(rider_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON bill_payments(bill_id);

-- Restaurants indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_desc ON restaurants(rating DESC);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);

-- Restaurant categories indexes
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON restaurant_categories(restaurant_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- User points indexes
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_products_pharmacy_id ON pharmacy_products(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_user_id ON pharmacy_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy_id ON pharmacy_orders(pharmacy_id);

-- Medical transports indexes
CREATE INDEX IF NOT EXISTS idx_medical_transports_user_id ON medical_transports(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_transports_date ON medical_transports(appointment_date);

-- Document pickups indexes
CREATE INDEX IF NOT EXISTS idx_document_pickups_user_id ON document_pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_document_pickups_tracking ON document_pickups(tracking_number);

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- Ticket comments indexes
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);

-- ========================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ========================================
-- All missing columns have been added
-- All missing tables have been created
-- All indexes have been created or verified

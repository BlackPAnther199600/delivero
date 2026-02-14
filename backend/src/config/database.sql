-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER,
  items JSONB,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bills table
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Restaurants table (optional, for future use)
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== NEW SERVICES TABLES ==========

-- BILL PAYMENTS SERVICE TABLE
CREATE TABLE IF NOT EXISTS bill_payments (
  id SERIAL PRIMARY KEY,
  bill_id INTEGER NOT NULL REFERENCES bills(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  rider_id INTEGER REFERENCES users(id),
  payment_method VARCHAR(50) NOT NULL, -- 'cash' or 'prepaid'
  amount DECIMAL(10, 2) NOT NULL,
  barcode_image_url VARCHAR(500),
  qr_code_image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending', -- pending, driver_assigned, paid, completed
  rider_payment_status VARCHAR(50), -- pending, collected, submitted
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PHARMACIES TABLE
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

-- PHARMACY PRODUCTS TABLE
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

-- PHARMACY ORDERS TABLE
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
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, dispatched, delivered
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEDICAL TRANSPORTS TABLE (Doctor Visits)
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
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, pickup_done, at_clinic, return_in_progress, completed
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOCUMENT PICKUPS TABLE
CREATE TABLE IF NOT EXISTS document_pickups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  rider_id INTEGER REFERENCES users(id),
  document_type VARCHAR(100) NOT NULL, -- certificate, permit, contract, etc
  pickup_location VARCHAR(500) NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lon DECIMAL(11, 8),
  delivery_address VARCHAR(500),
  delivery_lat DECIMAL(10, 8),
  delivery_lon DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, picked_up, delivered
  estimated_cost DECIMAL(10, 2),
  description TEXT,
  tracking_number VARCHAR(255) UNIQUE,
  signature_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_rider_id ON bill_payments(rider_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_products_pharmacy_id ON pharmacy_products(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_user_id ON pharmacy_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy_id ON pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_medical_transports_user_id ON medical_transports(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_transports_date ON medical_transports(appointment_date);
CREATE INDEX IF NOT EXISTS idx_document_pickups_user_id ON document_pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_document_pickups_tracking ON document_pickups(tracking_number);

-- ========== TICKET/SEGNALAZIONI SYSTEM ==========

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'bug', 'complaint', 'feature_request', 'support'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_urls JSONB,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);

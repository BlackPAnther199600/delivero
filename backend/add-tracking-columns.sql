-- Add tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_id INTEGER REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_latitude DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_longitude DECIMAL(11, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS received_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

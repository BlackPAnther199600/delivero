-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'order_created', 'restaurant_view', 'search', 'user_login', 'app_opened'
  user_id INTEGER REFERENCES users(id),
  event_data JSONB, -- Flexible data storage for different event types
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Metrics Table (aggregated data)
CREATE TABLE IF NOT EXISTS user_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  restaurant_views INTEGER DEFAULT 0,
  searches INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Popular Content Table
CREATE TABLE IF NOT EXISTS popular_content (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL, -- 'restaurant', 'menu_item', 'category'
  content_id VARCHAR(255) NOT NULL, -- restaurant_id, menu_item_id, category_id
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_date ON user_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_popular_content_type ON popular_content(content_type);
CREATE INDEX IF NOT EXISTS idx_popular_content_views ON popular_content(view_count);

-- Daily metrics aggregation function
CREATE OR REPLACE FUNCTION aggregate_daily_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO user_metrics (user_id, date, total_orders, total_spent, restaurant_views, searches)
  SELECT 
    user_id,
    DATE(created_at) as date,
    COUNT(CASE WHEN event_type = 'order_created' THEN 1 END) as total_orders,
    COALESCE(SUM(CASE WHEN event_type = 'order_created' THEN (event_data->>'amount')::DECIMAL ELSE 0 END), 0) as total_spent,
    COUNT(CASE WHEN event_type = 'restaurant_view' THEN 1 END) as restaurant_views,
    COUNT(CASE WHEN event_type = 'search' THEN 1 END) as searches
  FROM analytics_events
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL 1 DAY
    AND event_type IN ('order_created', 'restaurant_view', 'search')
  GROUP BY user_id, DATE(created_at)
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent,
    restaurant_views = EXCLUDED.restaurant_views,
    searches = EXCLUDED.searches;
END;
$$ LANGUAGE plpgsql;

-- Function to update popular content
CREATE OR REPLACE FUNCTION update_popular_content()
RETURNS void AS $$
BEGIN
  INSERT INTO popular_content (content_type, content_id, view_count, order_count, rating)
  SELECT 
    'restaurant',
    event_data->>'restaurant_id',
    COUNT(*) as view_count,
    COUNT(CASE WHEN event_type = 'order_created' THEN 1 END) as order_count,
    COALESCE(AVG(CASE WHEN event_type = 'order_rating' THEN (event_data->>'rating')::DECIMAL ELSE NULL END), 0) as rating
  FROM analytics_events
  WHERE event_type IN ('restaurant_view', 'order_created', 'order_rating')
    AND created_at >= CURRENT_DATE - INTERVAL 7 days
    AND event_data->>'restaurant_id' IS NOT NULL
  GROUP BY event_data->>'restaurant_id'
  ON CONFLICT (content_type, content_id) DO UPDATE SET
    view_count = EXCLUDED.view_count,
    order_count = EXCLUDED.order_count,
    rating = EXCLUDED.rating,
    last_accessed = NOW();
END;
$$ LANGUAGE plpgsql;

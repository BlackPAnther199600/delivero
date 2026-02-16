-- Add Missing Indexes for Delivero Database
-- This script adds the indexes that are missing from the current database

-- Add missing index for restaurant_categories.is_active
CREATE INDEX IF NOT EXISTS idx_restaurant_categories_active ON restaurant_categories(is_active);

-- Add missing index for menu_items.is_active
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);

-- Add missing index for menu_customizations.is_active
CREATE INDEX IF NOT EXISTS idx_menu_customizations_active ON menu_customizations(is_active);

-- Add missing index for reviews.is_verified
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_restaurant_categories_active',
        'idx_menu_items_active',
        'idx_menu_customizations_active',
        'idx_reviews_verified'
    )
ORDER BY tablename, indexname;

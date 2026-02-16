-- Database Structure Verification Query for Delivero
-- This query checks if all tables exist and have the correct columns and structure

-- Check if all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'users', 'restaurants', 'restaurant_categories', 
        'menu_items', 'menu_customizations', 'reviews',
        'orders', 'order_items', 'deliveries'
    )
ORDER BY table_name;

-- Check restaurants table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'restaurants'
ORDER BY ordinal_position;

-- Check restaurant_categories table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'restaurant_categories'
ORDER BY ordinal_position;

-- Check menu_items table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'menu_items'
ORDER BY ordinal_position;

-- Check menu_customizations table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'menu_customizations'
ORDER BY ordinal_position;

-- Check reviews table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'reviews'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN (
        'restaurant_categories', 'menu_items', 'menu_customizations', 'reviews'
    )
ORDER BY tc.table_name, tc.constraint_name;

-- Check indexes on restaurant tables
SELECT 
    indexname AS index_name,
    tablename AS table_name,
    indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'restaurants', 'restaurant_categories', 'menu_items', 
        'menu_customizations', 'reviews'
    )
ORDER BY tablename, indexname;

-- Check table row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins AS total_inserts,
    n_tup_upd AS total_updates,
    n_tup_del AS total_deletes,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'restaurants', 'restaurant_categories', 
        'menu_items', 'menu_customizations', 'reviews',
        'orders', 'order_items', 'deliveries'
    )
ORDER BY tablename;

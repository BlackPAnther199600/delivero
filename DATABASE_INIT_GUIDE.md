# 🗄️ Database Initialization Guide - Restaurant Discovery System

This guide covers how to initialize the Restaurant Discovery database tables and test data in Supabase.

## ✅ Prerequisites

- Supabase project created and active
- Backend connected to Supabase (PostgreSQL)
- SQL script ready: `backend/scripts/create_restaurants_tables.sql`

## 📋 Option 1: Via Supabase SQL Editor (Easiest for Most Users)

### Step 1: Open Supabase Console
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **delivero** project
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy SQL Script
1. Open this file: [backend/scripts/create_restaurants_tables.sql](backend/scripts/create_restaurants_tables.sql)
2. Copy the entire SQL script

### Step 3: Execute in Supabase
1. In Supabase SQL Editor, click **New Query**
2. Paste the entire SQL script into the editor
3. Click the blue **Run** button (or Cmd+Enter / Ctrl+Enter)
4. Wait for execution to complete ✅

### Step 4: Verify Tables Created
In Supabase SQL Editor, run this verification query:

```sql
-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- ✅ restaurants
- ✅ restaurant_categories
- ✅ menu_items
- ✅ menu_customizations
- ✅ reviews
- ✅ user_points

### Step 5: Verify Test Data
Run this query to see the 5 test restaurants:

```sql
SELECT id, name, rating, estimated_delivery_time, delivery_cost, is_active 
FROM restaurants 
ORDER BY id;
```

Expected result: **5 rows** with restaurants:
1. Pizzeria Roma (rating 4.8)
2. Burger House (rating 4.6)
3. Sushi Master (rating 4.9)
4. Poke Bowl (rating 4.7)
5. Kebab Palace (rating 4.5)

## 📋 Option 2: Via Node.js Script (Automatic)

If you prefer automated initialization:

### Step 1: Create Node Script
The script already exists at: `backend/scripts/init-restaurants.js`

### Step 2: Verify Backend Connection
Ensure your backend `.env` file has:
```env
DATABASE_URL=your_supabase_connection_string
```

### Step 3: Run the Script
```bash
cd backend
node scripts/init-restaurants.js
```

Expected output:
```
✅ Tables created successfully
Tables created:
- restaurants
- restaurant_categories
- menu_items
- menu_customizations
- reviews
- user_points
```

## 📊 Database Schema Overview

### 1. **restaurants** table
```sql
- id (PRIMARY KEY)
- name, description
- rating (0-5 scale)
- estimated_delivery_time (minutes)
- delivery_cost (EUR)
- address, phone, website
- image_url
- latitude, longitude (geolocation)
- is_open, is_active
- timestamps
```

### 2. **restaurant_categories** table
```sql
- id (PRIMARY KEY)
- restaurant_id (FOREIGN KEY → restaurants.id)
- name (e.g., "Pizze Classiche", "Dolci", "Bevande")
- description
- display_order
- is_active
- timestamps
```

### 3. **menu_items** table (Products/Dishes)
```sql
- id (PRIMARY KEY)
- restaurant_id (FOREIGN KEY)
- category_id (FOREIGN KEY)
- name, description
- price (EUR)
- image_url
- allergens (JSON array: ["glutine", "lattosio", "nocciole"])
- is_available, is_active
- timestamps
```

### 4. **menu_customizations** table (Options)
```sql
- id (PRIMARY KEY)
- menu_item_id (FOREIGN KEY)
- type: 'radio' | 'checkbox' | 'text'
- name (e.g., "Dimensione", "Topping", "Preferenze")
- price (additional cost, default 0)
- timestamps
```

### 5. **reviews** table
```sql
- id (PRIMARY KEY)
- order_id (FOREIGN KEY)
- restaurant_id, user_id (FOREIGN KEYS)
- food_rating (1-5), delivery_rating (1-5)
- comment, photos (JSON array)
- is_verified
- gamification_points
- timestamps
```

### 6. **user_points** table (Gamification)
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY, UNIQUE)
- points, total_reviews, total_photos
- last_review_date
- timestamps
```

## 🧪 Test Data Included

### 5 Test Restaurants
1. **Pizzeria Roma** - Italian/Pizza
   - Rating: 4.8 ⭐
   - Delivery: 25 min, €2.50
   - 3 categories with multiple dishes

2. **Burger House** - American/Burgers
   - Rating: 4.6 ⭐
   - Delivery: 15 min, €1.50
   - Premium burger options

3. **Sushi Master** - Japanese/Sushi
   - Rating: 4.9 ⭐
   - Delivery: 30 min, €3.00
   - Fresh chef-prepared sushi

4. **Poke Bowl** - Hawaiian/Healthy
   - Rating: 4.7 ⭐
   - Delivery: 15 min, €1.00
   - Fresh poke combinations

5. **Kebab Palace** - Middle Eastern/Kebab
   - Rating: 4.5 ⭐
   - Delivery: 10 min, €0.80
   - Grilled meat specialties

## 🔌 API Endpoints Ready

Once tables are created, the following endpoints are available:

### **GET /api/restaurants/categories**
Returns all food categories from the database:
```json
[
  {
    "id": 1,
    "name": "Pizza",
    "description": "Pizze tradizionali",
    "restaurant_count": 5
  },
  ...
]
```

**Used by**: HomeScreen `loadCategories()` function

### **GET /api/restaurants**
Returns restaurants with optional filters:
```
Query params:
- search: string (restaurant name)
- category: string (filter by category)
- rating_min: number (0-5)
- max_delivery_time: number (minutes)
- max_delivery_cost: number (EUR)
```

**Used by**: RestaurantsScreen with search/filters

### **GET /api/restaurants/:id**
Returns single restaurant with full menu:
```json
{
  "id": 1,
  "name": "Pizzeria Roma",
  "rating": 4.8,
  "menu": [
    {
      "category_id": 1,
      "category_name": "Classiche",
      "items": [
        {
          "id": 1,
          "name": "Margherita",
          "price": 8.50,
          "customizations": [
            {
              "id": 1,
              "type": "radio",
              "name": "Dimensione",
              "price": 0
            }
          ]
        }
      ]
    }
  ]
}
```

**Used by**: RestaurantDetailScreen for menu browsing

## ✅ API Integration Complete

The following mobile features use these database tables:

### 🏠 **HomeScreen**
- ✅ Loads categories from `/restaurants/categories` API
- ✅ Displays with emoji and color mapping
- ✅ Falls back to hardcoded categories if API fails

### 🍽️ **RestaurantDetailScreen**
- ✅ Loads restaurant by ID from `/restaurants/:id` API
- ✅ Shows full menu with categories
- ✅ Displays customization options (radio/checkbox/text)
- ✅ Integrates with CartContext

### 🛒 **CartScreen**
- ✅ Global cart state management
- ✅ Stores customizations per item
- ✅ AsyncStorage persistence
- ✅ Ready for checkout flow

## 🚀 Next Steps After Initialization

1. ✅ **Database tables created**
2. ✅ **Test data seeded (5 restaurants)**
3. ✅ **API endpoints working**
4. ⏳ **Test API endpoints with Postman/curl**
   ```bash
   # Test categories endpoint
   curl https://delivero-gyjx.onrender.com/api/restaurants/categories
   
   # Test restaurants list
   curl https://delivero-gyjx.onrender.com/api/restaurants
   
   # Test restaurant detail
   curl https://delivero-gyjx.onrender.com/api/restaurants/1
   ```

5. ⏳ **Launch mobile app and verify category loading**
6. ⏳ **Test complete flow**: Search → Browse Restaurant → Customize → Add to Cart

## 🐛 Troubleshooting

### ❌ "ERROR: permission denied"
**Solution**: Make sure Row Level Security (RLS) policies were created. These are included in the SQL script.

### ❌ "ERROR: foreign key constraint fails"
**Solution**: This shouldn't happen if running the complete script. The script creates tables in the correct order (restaurants first, then categories/items, etc.).

### ❌ "API returns empty categories"
**Solution**: 
1. Verify tables exist in Supabase SQL Editor
2. Check that test data was inserted (run verification query above)
3. Verify API route is registered: Check `backend/src/app.js` has `app.use("/api/restaurants", restaurantsRoutes)`

### ❌ "HomeScreen shows no categories"
**Solution**:
1. Check mobile network/backend connection
2. Open browser DevTools → Network tab → check `/api/restaurants/categories` request
3. If API fails, frontend falls back to hardcoded categories automatically

## 📝 Manual Test Commands

### Test in Supabase SQL Editor

```sql
-- 1. Check all restaurants
SELECT * FROM restaurants WHERE is_active = true;

-- 2. Count items per restaurant
SELECT 
  r.name, 
  COUNT(m.id) as item_count
FROM restaurants r
LEFT JOIN menu_items m ON r.id = m.restaurant_id
WHERE r.is_active = true
GROUP BY r.id, r.name;

-- 3. See menu customization types
SELECT 
  mi.name as dish,
  mc.type,
  mc.name as customization,
  mc.price
FROM menu_items mi
LEFT JOIN menu_customizations mc ON mi.id = mc.menu_item_id
ORDER BY mi.name;

-- 4. Check indexes were created
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

## 🎯 Success Criteria

✅ Database successfully initialized when:
- [ ] All 6 tables created in Supabase
- [ ] 5 test restaurants visible in `restaurants` table
- [ ] Categories, menu items visible for test restaurants
- [ ] `/api/restaurants/categories` API returns data
- [ ] HomeScreen loads and displays categories (with emoji, color)
- [ ] RestaurantDetailScreen shows menu for selected restaurant
- [ ] Cart tab shows (even if empty) with 0 badge

## 📞 Support

If tables don't initialize or API fails:

1. Check `backend/src/app.js` - verify restaurantsRoutes is imported and registered
2. Check backend logs for errors during API startup
3. Verify Supabase connection string in `DATABASE_URL` env var
4. Check RLS policies - run: `SELECT * FROM pg_policies WHERE tablename = 'restaurants';`

---

**Last Updated**: Feb 15, 2026
**Status**: 🟢 Ready for initialization

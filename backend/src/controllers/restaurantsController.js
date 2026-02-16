import db from '../config/db.js';

// Get all restaurants with filters
export const getRestaurants = async (req, res) => {
    try {
        const { search, category, rating_min, max_delivery_time, max_delivery_cost } = req.query;

        let query = `
      SELECT 
        id, name, rating, estimated_delivery_time as delivery_time, 
        delivery_cost, image_url, description, address, 
        latitude, longitude, is_open, 
        (SELECT COUNT(*) FROM reviews WHERE restaurant_id = restaurants.id) as review_count
      FROM restaurants
      WHERE is_active = true
    `;
        const params = [];

        if (search) {
            query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (category) {
            query += ` AND id IN (
        SELECT DISTINCT restaurant_id FROM restaurant_categories 
        WHERE name ILIKE $${params.length + 1} AND is_active = true
      )`;
            params.push(`%${category}%`);
        }

        if (rating_min) {
            query += ` AND rating >= $${params.length + 1}`;
            params.push(parseFloat(rating_min));
        }

        if (max_delivery_time) {
            query += ` AND estimated_delivery_time <= $${params.length + 1}`;
            params.push(parseInt(max_delivery_time));
        }

        if (max_delivery_cost) {
            query += ` AND delivery_cost <= $${params.length + 1}`;
            params.push(parseFloat(max_delivery_cost));
        }

        query += ` ORDER BY rating DESC LIMIT 50`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
    }
};

// Get single restaurant with full menu
export const getRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        // Get restaurant details
        const restaurantRes = await db.query(
            `SELECT 
              id, name, rating, estimated_delivery_time as delivery_time, 
              delivery_cost, image_url, description, address, 
              latitude, longitude, is_open, phone, website
       FROM restaurants 
       WHERE id = $1 AND is_active = true`,
            [id]
        );

        if (restaurantRes.rows.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const restaurant = restaurantRes.rows[0];

        // Get menu categories and items
        const menuRes = await db.query(
            `SELECT 
        rc.id as category_id,
        rc.name as category,
        COALESCE(json_agg(
          json_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', mi.description,
            'price', mi.price,
            'image_url', mi.image_url,
            'allergens', mi.allergens,
            'is_available', mi.is_available,
            'customizations', COALESCE((
              SELECT json_agg(
                json_build_object('id', id, 'name', name, 'price', price, 'type', type)
              ) FROM menu_customizations 
              WHERE menu_item_id = mi.id
            ), json_build_array())
          ) ORDER BY mi.name
        ) FILTER (WHERE mi.id IS NOT NULL), json_build_array()) as items
       FROM restaurant_categories rc
       LEFT JOIN menu_items mi ON rc.id = mi.category_id AND mi.is_active = true
       WHERE rc.restaurant_id = $1 AND rc.is_active = true
       GROUP BY rc.id, rc.name
       ORDER BY rc.display_order ASC`,
            [id]
        );

        const menu = menuRes.rows;

        // Get recent reviews
        const reviewsRes = await db.query(
            `SELECT id, food_rating, delivery_rating, comment, photos_urls, created_at, author_name
       FROM reviews
       WHERE restaurant_id = $1 AND is_verified = true
       ORDER BY created_at DESC
       LIMIT 10`,
            [id]
        );

        res.json({
            ...restaurant,
            menu,
            recent_reviews: reviewsRes.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
    }
};

// Get restaurant categories
export const getCategories = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT category 
             FROM restaurant_categories 
             WHERE is_active = true AND category IS NOT NULL
             GROUP BY category 
             ORDER BY MIN(display_order) ASC`
        );
        res.json(result.rows.map(r => r.category));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get restaurant reviews
export const getRestaurantReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { sort_by = 'recent', filter_by = 'all' } = req.query;

        let query = `
      SELECT id, food_rating, delivery_rating, comment, photos_urls, created_at, author_name
      FROM reviews
      WHERE restaurant_id = $1 AND is_verified = true
    `;
        const params = [restaurantId];

        if (filter_by === 'with_photos') {
            query += ` AND photos_urls IS NOT NULL AND array_length(photos_urls, 1) > 0`;
        } else if (filter_by === 'positive') {
            query += ` AND food_rating >= 4`;
        }

        if (sort_by === 'recent') {
            query += ` ORDER BY created_at DESC`;
        } else if (sort_by === 'highest') {
            query += ` ORDER BY food_rating DESC`;
        }

        query += ` LIMIT 50`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

export default {
    getRestaurants,
    getRestaurant,
    getCategories,
    getRestaurantReviews
};

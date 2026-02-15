import db from '../config/db.js';

// Create review (verified purchase only)
export const createReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId, restaurantId, foodRating, deliveryRating, comment, photosUrls } = req.body;

        // Verify order exists and is delivered
        const orderRes = await db.query(
            `SELECT id, user_id, rider_id, status, created_at FROM orders 
       WHERE id = $1 AND user_id = $2 AND status = 'delivered'`,
            [orderId, userId]
        );

        if (orderRes.rows.length === 0) {
            return res.status(403).json({ message: 'Only verified purchases can be reviewed' });
        }

        const order = orderRes.rows[0];

        // Check time limit (48 hours)
        const hoursSinceDelivery = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceDelivery > 48) {
            return res.status(400).json({ message: 'Review window closed (48 hours max)' });
        }

        // Check if already reviewed
        const existingRes = await db.query(
            `SELECT id FROM reviews WHERE order_id = $1`,
            [orderId]
        );
        if (existingRes.rows.length > 0) {
            return res.status(400).json({ message: 'Already reviewed this order' });
        }

        // Sanitize comment (basic moderation)
        let sanitized = comment || '';
        const bannedWords = ['badword1', 'badword2']; // Add actual banned words
        bannedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            sanitized = sanitized.replace(regex, '***');
        });

        // Insert review
        const result = await db.query(
            `INSERT INTO reviews (order_id, restaurant_id, rider_id, food_rating, delivery_rating, comment, photos_urls, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
       RETURNING *`,
            [orderId, restaurantId, order.rider_id, foodRating, deliveryRating, sanitized, photosUrls || []]
        );

        // Award gamification points for detailed review with photo
        let points = 10; // base points
        if (comment && comment.length >= 50) points += 5;
        if (photosUrls && photosUrls.length > 0) points += 15;

        try {
            await db.query(
                `INSERT INTO user_points (user_id, points, reason) VALUES ($1, $2, $3)`,
                [userId, points, `Review reward: ${points} points`]
            );
        } catch (e) {
            console.warn('Failed to award points:', e.message);
        }

        // Update restaurant rating (weighted by recency)
        await updateRestaurantRating(restaurantId);

        res.status(201).json({
            ...result.rows[0],
            points_awarded: points
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};

// Calculate weighted restaurant rating
const updateRestaurantRating = async (restaurantId) => {
    try {
        const result = await db.query(
            `SELECT AVG(food_rating * (1 + EXTRACT(EPOCH FROM (NOW() - created_at)) / 2592000)) as weighted_avg
       FROM reviews WHERE restaurant_id = $1 AND is_verified = true AND created_at > NOW() - INTERVAL '90 days'`,
            [restaurantId]
        );

        const newRating = parseFloat(result.rows[0]?.weighted_avg || 4.5);

        await db.query(
            `UPDATE restaurants SET rating = $1 WHERE id = $2`,
            [Math.min(newRating, 5), restaurantId]
        );
    } catch (e) {
        console.warn('Error updating restaurant rating:', e.message);
    }
};

// Get reviews with filters
export const getReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { sort = 'recent', filter = 'all' } = req.query;

        let query = `
      SELECT id, food_rating, delivery_rating, comment, photos_urls, created_at, author_name
      FROM reviews WHERE restaurant_id = $1 AND is_verified = true
    `;
        const params = [restaurantId];

        if (filter === 'with_photos') {
            query += ` AND photos_urls IS NOT NULL AND array_length(photos_urls, 1) > 0`;
        } else if (filter === 'positive') {
            query += ` AND food_rating >= 4`;
        }

        query += sort === 'recent' ? ` ORDER BY created_at DESC` : ` ORDER BY food_rating DESC`;
        query += ` LIMIT 20`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

export default {
    createReview,
    getReviews,
    updateRestaurantRating
};

import db from '../config/db.js';
import { hashPassword } from '../utils/auth.js';

// Create a new pharmacy
export const createPharmacy = async (email, password, name, phone, address, city, postalCode, licenseNumber, lat, lon) => {
  try {
    const hashedPassword = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO pharmacies (email, password, name, phone, address, city, postal_code, license_number, lat, lon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, name, phone, address, city, postal_code, license_number, is_verified, is_active`,
      [email, hashedPassword, name, phone, address, city, postalCode, licenseNumber, lat, lon]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get pharmacy by ID
export const getPharmacyById = async (pharmacyId) => {
  try {
    const result = await db.query(
      `SELECT id, email, name, phone, address, city, postal_code, license_number, lat, lon, is_verified, is_active, rating, created_at
       FROM pharmacies WHERE id = $1`,
      [pharmacyId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get pharmacy by email
export const getPharmacyByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM pharmacies WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all active pharmacies
export const getAllPharmacies = async (lat = null, lon = null, radiusKm = 5) => {
  try {
    let query = `SELECT id, name, phone, address, city, postal_code, lat, lon, is_verified, rating, created_at
                 FROM pharmacies WHERE is_active = TRUE AND is_verified = TRUE`;
    const params = [];

    if (lat && lon) {
      // Haversine formula for distance calculation
      query += ` ORDER BY
                 (6371 * acos(cos(radians($1)) * cos(radians(lat)) * cos(radians(lon) - radians($2)) + sin(radians($1)) * sin(radians(lat)))) ASC`;
      params.push(lat, lon);
    } else {
      query += ` ORDER BY rating DESC`;
    }

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Verify pharmacy (admin only)
export const verifyPharmacy = async (pharmacyId) => {
  try {
    const result = await db.query(
      `UPDATE pharmacies SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [pharmacyId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Add pharmacy product
export const addPharmacyProduct = async (pharmacyId, name, description, category, price, stockQuantity, imageUrl) => {
  try {
    const result = await db.query(
      `INSERT INTO pharmacy_products (pharmacy_id, name, description, category, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [pharmacyId, name, description, category, price, stockQuantity, imageUrl]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get pharmacy products
export const getPharmacyProducts = async (pharmacyId) => {
  try {
    const result = await db.query(
      `SELECT * FROM pharmacy_products WHERE pharmacy_id = $1 AND active = TRUE ORDER BY name ASC`,
      [pharmacyId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Update product stock
export const updateProductStock = async (productId, newQuantity) => {
  try {
    const result = await db.query(
      `UPDATE pharmacy_products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [newQuantity, productId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Create pharmacy order
export const createPharmacyOrder = async (userId, pharmacyId, items, totalAmount, deliveryAddress, lat, lon) => {
  try {
    const result = await db.query(
      `INSERT INTO pharmacy_orders (user_id, pharmacy_id, items, total_amount, delivery_address, delivery_lat, delivery_lon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, pharmacyId, JSON.stringify(items), totalAmount, deliveryAddress, lat, lon]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get pharmacy orders
export const getPharmacyOrdersForPharmacy = async (pharmacyId, status = null) => {
  try {
    let query = `SELECT po.*, u.name as customer_name, u.phone, u.email
                 FROM pharmacy_orders po
                 JOIN users u ON po.user_id = u.id
                 WHERE po.pharmacy_id = $1`;
    const params = [pharmacyId];

    if (status) {
      query += ` AND po.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY po.created_at DESC`;
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get user pharmacy orders
export const getUserPharmacyOrders = async (userId) => {
  try {
    const result = await db.query(
      `SELECT po.*, p.name as pharmacy_name, p.phone, p.address
       FROM pharmacy_orders po
       JOIN pharmacies p ON po.pharmacy_id = p.id
       WHERE po.user_id = $1
       ORDER BY po.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get pending pharmacy orders for riders
export const getPendingPharmacyOrders = async (riderId = null) => {
  try {
    let query = `SELECT po.*, p.name as pharmacy_name, p.address, u.name as customer_name, u.phone
                 FROM pharmacy_orders po
                 JOIN pharmacies p ON po.pharmacy_id = p.id
                 JOIN users u ON po.user_id = u.id
                 WHERE po.status IN ('confirmed', 'dispatched')`;
    const params = [];

    if (riderId) {
      query += ` AND (po.rider_id = $1 OR po.rider_id IS NULL)`;
      params.push(riderId);
    }

    query += ` ORDER BY po.created_at ASC`;
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Assign rider to pharmacy order
export const assignRiderToPharmacyOrder = async (orderId, riderId) => {
  try {
    const result = await db.query(
      `UPDATE pharmacy_orders SET rider_id = $1, status = 'dispatched', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [riderId, orderId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update pharmacy order status
export const updatePharmacyOrderStatus = async (orderId, status, notes = null) => {
  try {
    const query = notes
      ? `UPDATE pharmacy_orders SET status = $1, delivery_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`
      : `UPDATE pharmacy_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;

    const params = notes ? [status, notes, orderId] : [status, orderId];
    const result = await db.query(query, params);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

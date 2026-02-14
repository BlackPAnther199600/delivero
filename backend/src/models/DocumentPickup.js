import db from '../config/db.js';

// Generate tracking number
const generateTrackingNumber = () => {
  return 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create document pickup request
export const createDocumentPickup = async (userId, documentType, pickupLocation, pickupLat, pickupLon, deliveryAddress, deliveryLat, deliveryLon, estimatedCost, description, signatureRequired) => {
  try {
    const trackingNumber = generateTrackingNumber();
    const result = await db.query(
      `INSERT INTO document_pickups 
       (user_id, document_type, pickup_location, pickup_lat, pickup_lon, delivery_address, delivery_lat, delivery_lon, estimated_cost, description, signature_required, tracking_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [userId, documentType, pickupLocation, pickupLat, pickupLon, deliveryAddress, deliveryLat, deliveryLon, estimatedCost, description, signatureRequired, trackingNumber]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get document pickup by ID
export const getDocumentPickupById = async (pickupId) => {
  try {
    const result = await db.query(
      `SELECT dp.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
              r.name as rider_name, r.phone as rider_phone
       FROM document_pickups dp
       JOIN users u ON dp.user_id = u.id
       LEFT JOIN users r ON dp.rider_id = r.id
       WHERE dp.id = $1`,
      [pickupId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get document pickup by tracking number
export const getDocumentPickupByTracking = async (trackingNumber) => {
  try {
    const result = await db.query(
      `SELECT dp.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
              r.name as rider_name, r.phone as rider_phone
       FROM document_pickups dp
       JOIN users u ON dp.user_id = u.id
       LEFT JOIN users r ON dp.rider_id = r.id
       WHERE dp.tracking_number = $1`,
      [trackingNumber]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get user document pickups
export const getUserDocumentPickups = async (userId) => {
  try {
    const result = await db.query(
      `SELECT dp.*, r.name as rider_name, r.phone as rider_phone
       FROM document_pickups dp
       LEFT JOIN users r ON dp.rider_id = r.id
       WHERE dp.user_id = $1
       ORDER BY dp.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get pending document pickups for riders
export const getPendingDocumentPickups = async (riderId = null) => {
  try {
    let query = `SELECT dp.*, u.name as customer_name, u.phone as customer_phone, u.email
                 FROM document_pickups dp
                 JOIN users u ON dp.user_id = u.id
                 WHERE dp.status IN ('pending', 'confirmed')`;
    const params = [];

    if (riderId) {
      query += ` AND (dp.rider_id = $1 OR dp.rider_id IS NULL)`;
      params.push(riderId);
    }

    query += ` ORDER BY dp.created_at ASC`;
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Assign rider to document pickup
export const assignRiderToDocumentPickup = async (pickupId, riderId) => {
  try {
    const result = await db.query(
      `UPDATE document_pickups SET rider_id = $1, status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [riderId, pickupId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update document pickup status
export const updateDocumentPickupStatus = async (pickupId, status) => {
  try {
    const result = await db.query(
      `UPDATE document_pickups SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, pickupId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get active document pickups for rider
export const getRiderActivePickups = async (riderId) => {
  try {
    const result = await db.query(
      `SELECT dp.*, u.name as customer_name, u.phone as customer_phone
       FROM document_pickups dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.rider_id = $1 AND dp.status IN ('confirmed', 'picked_up')
       ORDER BY dp.created_at ASC`,
      [riderId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get document pickup statistics
export const getDocumentPickupStats = async (startDate = null, endDate = null) => {
  try {
    let query = `SELECT
                   COUNT(*) as total_pickups,
                   SUM(estimated_cost) as total_estimated_cost,
                   COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
                   COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                   COUNT(CASE WHEN signature_required = TRUE THEN 1 END) as requiring_signature,
                   COUNT(DISTINCT document_type) as document_types_count
                 FROM document_pickups`;
    const params = [];

    if (startDate && endDate) {
      query += ` WHERE created_at BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    }

    const result = await db.query(query, params);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get document types statistics
export const getDocumentTypeStats = async () => {
  try {
    const result = await db.query(
      `SELECT document_type, COUNT(*) as count, COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count
       FROM document_pickups
       GROUP BY document_type
       ORDER BY count DESC`
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

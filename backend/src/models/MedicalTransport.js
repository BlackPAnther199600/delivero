import db from '../config/db.js';

// Create medical transport request
export const createMedicalTransport = async (userId, doctorName, clinicName, clinicAddress, clinicPhone, pickupAddress, pickupLat, pickupLon, appointmentDate, appointmentTime, returnTrip, specialRequirements) => {
  try {
    const result = await db.query(
      `INSERT INTO medical_transports 
       (user_id, doctor_name, clinic_name, clinic_address, clinic_phone, pickup_address, pickup_lat, pickup_lon, appointment_date, appointment_time, return_trip, special_requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [userId, doctorName, clinicName, clinicAddress, clinicPhone, pickupAddress, pickupLat, pickupLon, appointmentDate, appointmentTime, returnTrip, specialRequirements]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get medical transport by ID
export const getMedicalTransportById = async (transportId) => {
  try {
    const result = await db.query(
      `SELECT mt.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
              r.name as rider_name, r.phone as rider_phone
       FROM medical_transports mt
       JOIN users u ON mt.user_id = u.id
       LEFT JOIN users r ON mt.rider_id = r.id
       WHERE mt.id = $1`,
      [transportId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get user medical transports
export const getUserMedicalTransports = async (userId) => {
  try {
    const result = await db.query(
      `SELECT mt.*, r.name as rider_name, r.phone as rider_phone
       FROM medical_transports mt
       LEFT JOIN users r ON mt.rider_id = r.id
       WHERE mt.user_id = $1
       ORDER BY mt.appointment_date DESC, mt.appointment_time DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get pending medical transports for riders
export const getPendingMedicalTransports = async (riderId = null) => {
  try {
    let query = `SELECT mt.*, u.name as customer_name, u.phone as customer_phone, u.email
                 FROM medical_transports mt
                 JOIN users u ON mt.user_id = u.id
                 WHERE mt.status IN ('pending', 'confirmed')`;
    const params = [];

    if (riderId) {
      query += ` AND (mt.rider_id = $1 OR mt.rider_id IS NULL)`;
      params.push(riderId);
    }

    query += ` ORDER BY mt.appointment_date ASC, mt.appointment_time ASC`;
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Assign rider to medical transport
export const assignRiderToMedicalTransport = async (transportId, riderId) => {
  try {
    const result = await db.query(
      `UPDATE medical_transports SET rider_id = $1, status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [riderId, transportId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update medical transport status
export const updateMedicalTransportStatus = async (transportId, status) => {
  try {
    const result = await db.query(
      `UPDATE medical_transports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, transportId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Add medical transport notes
export const addMedicalTransportNotes = async (transportId, notes) => {
  try {
    const result = await db.query(
      `UPDATE medical_transports SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [notes, transportId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update medical transport cost
export const updateMedicalTransportCost = async (transportId, estimatedCost, actualCost = null) => {
  try {
    const query = actualCost
      ? `UPDATE medical_transports SET estimated_cost = $1, actual_cost = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`
      : `UPDATE medical_transports SET estimated_cost = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;

    const params = actualCost ? [estimatedCost, actualCost, transportId] : [estimatedCost, transportId];
    const result = await db.query(query, params);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (daysAhead = 7) => {
  try {
    const result = await db.query(
      `SELECT mt.*, u.name as customer_name, u.phone as customer_phone, r.name as rider_name
       FROM medical_transports mt
       JOIN users u ON mt.user_id = u.id
       LEFT JOIN users r ON mt.rider_id = r.id
       WHERE mt.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1 * INTERVAL '1 day'
       AND mt.status != 'completed'
       ORDER BY mt.appointment_date ASC, mt.appointment_time ASC`,
      [daysAhead]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get medical transport statistics
export const getMedicalTransportStats = async (startDate = null, endDate = null) => {
  try {
    let query = `SELECT
                   COUNT(*) as total_transports,
                   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                   COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                   COUNT(CASE WHEN return_trip = TRUE THEN 1 END) as with_return_trip,
                   AVG(CASE WHEN actual_cost IS NOT NULL THEN actual_cost END) as avg_cost
                 FROM medical_transports`;
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

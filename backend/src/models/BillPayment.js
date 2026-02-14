import db from '../config/db.js';

// Create a new bill payment request
export const createBillPayment = async (billId, userId, paymentMethod, amount) => {
  try {
    const result = await db.query(
      `INSERT INTO bill_payments (bill_id, user_id, payment_method, amount, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [billId, userId, paymentMethod, amount]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get bill payment by ID
export const getBillPaymentById = async (paymentId) => {
  try {
    const result = await db.query(
      `SELECT bp.*, b.type, b.due_date, u.name, u.phone, u.email
       FROM bill_payments bp
       JOIN bills b ON bp.bill_id = b.id
       JOIN users u ON bp.user_id = u.id
       WHERE bp.id = $1`,
      [paymentId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all bill payments for a user
export const getUserBillPayments = async (userId) => {
  try {
    const result = await db.query(
      `SELECT bp.*, b.type, b.due_date, b.description
       FROM bill_payments bp
       JOIN bills b ON bp.bill_id = b.id
       WHERE bp.user_id = $1
       ORDER BY bp.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get pending bill payments for riders
export const getPendingBillPayments = async (riderId = null) => {
  try {
    let query = `SELECT bp.*, b.type, b.due_date, u.name as customer_name, u.phone, u.email
                 FROM bill_payments bp
                 JOIN bills b ON bp.bill_id = b.id
                 JOIN users u ON bp.user_id = u.id
                 WHERE bp.status = 'driver_assigned'`;
    const params = [];

    if (riderId) {
      query += ` AND bp.rider_id = $1`;
      params.push(riderId);
    }

    query += ` ORDER BY bp.created_at ASC`;
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Update bill payment images (S3 URLs)
export const updateBillPaymentImages = async (paymentId, barcodeUrl, qrCodeUrl) => {
  try {
    const result = await db.query(
      `UPDATE bill_payments
       SET barcode_image_url = $1, qr_code_image_url = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [barcodeUrl, qrCodeUrl, paymentId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Assign rider to bill payment
export const assignRiderToBillPayment = async (paymentId, riderId) => {
  try {
    const result = await db.query(
      `UPDATE bill_payments
       SET rider_id = $1, status = 'driver_assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [riderId, paymentId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update payment status
export const updateBillPaymentStatus = async (paymentId, status, riderPaymentStatus = null) => {
  try {
    const query = riderPaymentStatus
      ? `UPDATE bill_payments
         SET status = $1, rider_payment_status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`
      : `UPDATE bill_payments
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`;

    const params = riderPaymentStatus
      ? [status, riderPaymentStatus, paymentId]
      : [status, paymentId];

    const result = await db.query(query, params);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Add rider payment notes
export const addBillPaymentNotes = async (paymentId, notes) => {
  try {
    const result = await db.query(
      `UPDATE bill_payments
       SET notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [notes, paymentId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get bill payment statistics (for admin)
export const getBillPaymentStats = async (startDate = null, endDate = null) => {
  try {
    let query = `SELECT
                   COUNT(*) as total_payments,
                   SUM(amount) as total_amount,
                   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                   COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                   COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_payments,
                   COUNT(CASE WHEN payment_method = 'prepaid' THEN 1 END) as prepaid_payments
                 FROM bill_payments`;
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

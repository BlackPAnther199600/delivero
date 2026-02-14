import db from '../config/db.js';

// Create ticket/segnalazione
export const createTicket = async (userId, type, title, description, attachmentUrls = null) => {
  try {
    const result = await db.query(
      `INSERT INTO tickets (user_id, type, title, description, attachment_urls, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [userId, type, title, description, attachmentUrls ? JSON.stringify(attachmentUrls) : null]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all tickets (admin)
export const getAllTickets = async (filters = {}) => {
  try {
    let query = `SELECT t.*, u.name as user_name, u.email as user_email, u.role
                 FROM tickets t
                 JOIN users u ON t.user_id = u.id
                 WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.type) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.userId) {
      query += ` AND t.user_id = $${paramIndex}`;
      params.push(filters.userId);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC`;
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get user tickets
export const getUserTickets = async (userId) => {
  try {
    const result = await db.query(
      `SELECT * FROM tickets 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get ticket by ID
export const getTicketById = async (ticketId) => {
  try {
    const result = await db.query(
      `SELECT t.*, u.name as user_name, u.email, u.role
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [ticketId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update ticket status
export const updateTicketStatus = async (ticketId, status, adminNotes = null) => {
  try {
    const result = await db.query(
      `UPDATE tickets 
       SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes, ticketId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Add comment to ticket
export const addTicketComment = async (ticketId, userId, comment) => {
  try {
    const result = await db.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ticketId, userId, comment]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get ticket comments
export const getTicketComments = async (ticketId) => {
  try {
    const result = await db.query(
      `SELECT tc.*, u.name as user_name, u.role
       FROM ticket_comments tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = $1
       ORDER BY tc.created_at ASC`,
      [ticketId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get ticket statistics
export const getTicketStats = async () => {
  try {
    const result = await db.query(
      `SELECT
         COUNT(*) as total_tickets,
         COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
         COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
         COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
         COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
         COUNT(CASE WHEN type = 'bug' THEN 1 END) as bug_count,
         COUNT(CASE WHEN type = 'feature' THEN 1 END) as feature_count,
         COUNT(CASE WHEN type = 'complaint' THEN 1 END) as complaint_count
       FROM tickets`
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

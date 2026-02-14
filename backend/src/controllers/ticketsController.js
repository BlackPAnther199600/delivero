import pool from '../config/db.js';

// Create a new ticket
async function createTicket(userId, type, title, description, attachmentUrls = []) {
  try {
    const result = await pool.query(
      `INSERT INTO tickets (user_id, type, title, description, attachment_urls, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [userId, type, title, description, JSON.stringify(attachmentUrls)]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

// Get all tickets (admin)
async function getAllTickets(filters = {}) {
  try {
    let query = 'SELECT t.*, u.name as user_name, u.email as user_email FROM tickets t JOIN users u ON t.user_id = u.id WHERE 1=1';
    const params = [];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND t.status = $${params.length}`;
    }

    if (filters.type) {
      params.push(filters.type);
      query += ` AND t.type = $${params.length}`;
    }

    if (filters.priority) {
      params.push(filters.priority);
      query += ` AND t.priority = $${params.length}`;
    }

    query += ' ORDER BY t.created_at DESC LIMIT 100';
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting all tickets:', error);
    throw error;
  }
}

// Get user's tickets
async function getUserTickets(userId) {
  try {
    const result = await pool.query(
      `SELECT * FROM tickets 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
}

// Get ticket by ID with comments
async function getTicketById(ticketId) {
  try {
    const ticketResult = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email 
       FROM tickets t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return null;
    }

    const ticket = ticketResult.rows[0];

    // Get comments
    const commentsResult = await pool.query(
      `SELECT tc.*, u.name as user_name, u.role 
       FROM ticket_comments tc 
       JOIN users u ON tc.user_id = u.id 
       WHERE tc.ticket_id = $1 
       ORDER BY tc.created_at ASC`,
      [ticketId]
    );

    ticket.comments = commentsResult.rows;
    return ticket;
  } catch (error) {
    console.error('Error getting ticket by ID:', error);
    throw error;
  }
}

// Update ticket status
async function updateTicketStatus(ticketId, status, adminNotes = null) {
  try {
    const result = await pool.query(
      `UPDATE tickets 
       SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes, ticketId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

// Update ticket priority
async function updateTicketPriority(ticketId, priority) {
  try {
    const result = await pool.query(
      `UPDATE tickets 
       SET priority = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [priority, ticketId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    throw error;
  }
}

// Add comment to ticket
async function addTicketComment(ticketId, userId, comment) {
  try {
    const result = await pool.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ticketId, userId, comment]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding ticket comment:', error);
    throw error;
  }
}

// Get ticket comments
async function getTicketComments(ticketId) {
  try {
    const result = await pool.query(
      `SELECT tc.*, u.name as user_name, u.role 
       FROM ticket_comments tc 
       JOIN users u ON tc.user_id = u.id 
       WHERE tc.ticket_id = $1 
       ORDER BY tc.created_at ASC`,
      [ticketId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting ticket comments:', error);
    throw error;
  }
}

// Get ticket statistics
async function getTicketStats() {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN type = 'bug' THEN 1 END) as bug_count,
        COUNT(CASE WHEN type = 'complaint' THEN 1 END) as complaint_count,
        COUNT(CASE WHEN type = 'feature_request' THEN 1 END) as feature_count,
        COUNT(CASE WHEN type = 'support' THEN 1 END) as support_count,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_count
       FROM tickets`
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting ticket stats:', error);
    throw error;
  }
}

// Search tickets
async function searchTickets(searchTerm) {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email 
       FROM tickets t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.title ILIKE $1 OR t.description ILIKE $1
       ORDER BY t.created_at DESC`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching tickets:', error);
    throw error;
  }
}

// Delete ticket (admin)
async function deleteTicket(ticketId) {
  try {
    // Ticket_comments will be cascade deleted
    const result = await pool.query(
      `DELETE FROM tickets WHERE id = $1 RETURNING *`,
      [ticketId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}

export {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  updateTicketPriority,
  addTicketComment,
  getTicketComments,
  getTicketStats,
  searchTickets,
  deleteTicket
};

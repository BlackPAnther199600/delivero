import express from 'express';
import {
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
} from '../controllers/ticketsController.js';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/db.js';

const router = express.Router();

// Create a new ticket (any authenticated user)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, description, attachmentUrls } = req.body;
    if (!type || !title || !description) {
      return res.status(400).json({ error: 'Type, title, and description are required' });
    }

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const ticket = await createTicket(userId, type, title, description, attachmentUrls || []);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get all tickets (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, type, priority } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const tickets = await getAllTickets(filters);
    res.json(tickets);
  } catch (error) {
    console.error('Error getting all tickets:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Get all tickets (admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, type, priority } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const tickets = await getAllTickets(filters);
    res.json(tickets);
  } catch (error) {
    console.error('Error getting all tickets:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Get user's tickets
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const tickets = await getUserTickets(userId);
    res.json(tickets);
  } catch (error) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({ error: 'Failed to get your tickets' });
  }
});

// Get ticket by ID with comments
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check authorization: user can only see their own tickets, admin can see all
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;

    if (role !== 'admin' && role !== 'manager' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// Update ticket status (admin only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const ticket = await updateTicketStatus(req.params.id, status, adminNotes);
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Update ticket priority (admin only)
router.patch('/:id/priority', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { priority } = req.body;
    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }

    const ticket = await updateTicketPriority(req.params.id, priority);
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    res.status(500).json({ error: 'Failed to update ticket priority' });
  }
});

// Add comment to ticket
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check authorization: can comment on own tickets or if admin
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;

    if (role !== 'admin' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newComment = await addTicketComment(req.params.id, userId, comment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get ticket comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    // Check authorization
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;

    if (role !== 'admin' && role !== 'manager' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = await getTicketComments(req.params.id);
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Get ticket statistics (admin only)
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await getTicketStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting ticket stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Search tickets
router.get('/search/:term', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const tickets = await searchTickets(req.params.term);
    res.json(tickets);
  } catch (error) {
    console.error('Error searching tickets:', error);
    res.status(500).json({ error: 'Failed to search tickets' });
  }
});

// Delete ticket (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const ticket = await deleteTicket(req.params.id);
    res.json({ message: 'Ticket deleted', ticket });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;

import db from '../config/db.js';
import { sendBillReminder } from '../services/email.js';

export const getBills = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await db.query(
      'SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero delle bollette', error: error.message });
  }
};

export const addBill = async (req, res) => {
  try {
    const { type, amount, dueDate, description } = req.body;
    const userId = req.user.userId;

    if (!type || !amount || !dueDate) {
      return res.status(400).json({ message: 'Campi obbligatori mancanti' });
    }

    const result = await db.query(
      'INSERT INTO bills (user_id, type, amount, due_date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, type, amount, dueDate, description]
    );

    // Send reminder email
    const userResult = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0) {
      await sendBillReminder(userResult.rows[0].email, type, dueDate, amount);
    }

    res.status(201).json({ message: 'Bolletta creata', bill: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella creazione bolletta', error: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      'DELETE FROM bills WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bolletta non trovata' });
    }

    res.status(200).json({ message: 'Bolletta eliminata', bill: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella eliminazione bolletta', error: error.message });
  }
};

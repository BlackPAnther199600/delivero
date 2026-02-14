import { createUser, getUserByEmail, verifyUserPassword, getUserById } from '../models/User.js';
import { generateToken } from '../utils/auth.js';
import db from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, e nome sono obbligatori' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password deve avere almeno 6 caratteri' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email già registrata' });
    }

    // Create user with role (default: 'customer')
    const user = await createUser(email, password, name, role || 'customer');
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: 'Utente registrato con successo',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella registrazione', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatori' });
    }

    const user = await verifyUserPassword(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel login', error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dati utente', error: error.message });
  }
};

export const updatePushToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { push_token } = req.body;
    if (!push_token) {
      return res.status(400).json({ message: 'push_token is required' });
    }
    await db.query('UPDATE users SET push_token = $1 WHERE id = $2', [push_token, userId]);
    res.status(200).json({ message: 'Push token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel salvataggio push token', error: error.message });
  }
};

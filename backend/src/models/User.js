import db from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/auth.js';

export const createUser = async (email, password, name, role = 'customer') => {
  try {
    const hashedPassword = await hashPassword(password);
    const result = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, role]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const result = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const verifyUserPassword = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) return null;

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId, name, email) => {
  try {
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, email, name',
      [name, email, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

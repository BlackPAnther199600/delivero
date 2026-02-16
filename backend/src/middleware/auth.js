import { verifyToken } from '../utils/auth.js';
import db from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  // Verify user still exists and is active
  try {
    const result = await db.query('SELECT id, role, email FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'User not found' });
    }

    req.user = {
      ...decoded,
      role: result.rows[0].role,
      email: result.rows[0].email
    };
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

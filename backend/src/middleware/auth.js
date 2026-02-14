import { verifyToken } from '../utils/auth.js';
import db from '../config/db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    db.query('SELECT role FROM users WHERE id = $1', [req.user.userId], (err, result) => {
      if (err || result.rows.length === 0) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (!roles.includes(result.rows[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    });
  };
};

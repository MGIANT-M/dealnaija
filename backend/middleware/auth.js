const jwt = require('jsonwebtoken');
const db = require('../db');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query(
      'SELECT id, email, role, is_approved, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });
    if (!result.rows[0].is_active) return res.status(401).json({ error: 'Account deactivated' });

    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

const requireApproved = (req, res, next) => {
  if (req.user.role === 'agent' && !req.user.is_approved) {
    return res.status(403).json({ error: 'Agent account pending approval' });
  }
  next();
};

module.exports = { auth, requireRole, requireApproved };

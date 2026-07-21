const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentication is not configured' });
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };

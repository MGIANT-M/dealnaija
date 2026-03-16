const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, u.full_name as sender_name, u.agency_name,
             p.title as property_title, p.city, p.state, p.price
      FROM broadcasts b
      JOIN users u ON b.sender_id=u.id
      LEFT JOIN properties p ON b.property_id=p.id
      WHERE b.is_active=TRUE ORDER BY b.created_at DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

router.post('/', auth, requireRole('agent'), async (req, res) => {
  try {
    const { property_id, title, message, broadcast_type } = req.body;
    const result = await db.query(
      `INSERT INTO broadcasts (sender_id, property_id, title, message, broadcast_type)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, property_id, title, message, broadcast_type || 'deal_alert']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

module.exports = router;

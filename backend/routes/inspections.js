const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requireRole('investor'), async (req, res) => {
  try {
    const { property_id, preferred_date, preferred_time, notes } = req.body;
    const property = await db.query(
      'SELECT agent_id FROM properties WHERE id = $1 AND status = $2',
      [property_id, 'approved']
    );
    if (!property.rows[0]) return res.status(404).json({ error: 'Property not found' });
    const result = await db.query(
      `INSERT INTO inspections (property_id, investor_id, agent_id, preferred_date, preferred_time, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [property_id, req.user.id, property.rows[0].agent_id, preferred_date, preferred_time, notes]
    );
    await db.query(
      'UPDATE properties SET inquiries_count = inquiries_count + 1 WHERE id = $1',
      [property_id]
    );
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [property.rows[0].agent_id, 'New Inspection Request',
       'An investor has requested an inspection.', 'inspection',
       result.rows[0].id, 'inspection']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to request inspection' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'agent') {
      query = `
        SELECT i.*, p.title as property_title, p.city, p.state,
               u.full_name as investor_name, u.phone as investor_phone, u.email as investor_email
        FROM inspections i
        JOIN properties p ON i.property_id = p.id
        JOIN users u ON i.investor_id = u.id
        WHERE i.agent_id = $1 ORDER BY i.created_at DESC`;
      params = [req.user.id];
    } else {
      query = `
        SELECT i.*, p.title as property_title, p.city, p.state,
               u.full_name as agent_name, u.phone as agent_phone
        FROM inspections i
        JOIN properties p ON i.property_id = p.id
        JOIN users u ON i.agent_id = u.id
        WHERE i.investor_id = $1 ORDER BY i.created_at DESC`;
      params = [req.user.id];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

router.put('/:id/schedule', auth, requireRole('agent'), async (req, res) => {
  try {
    const { scheduled_at } = req.body;
    const result = await db.query(
      `UPDATE inspections SET status='scheduled', scheduled_at=$1, updated_at=NOW()
       WHERE id=$2 AND agent_id=$3 RETURNING *`,
      [scheduled_at, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to schedule inspection' });
  }
});

router.put('/:id/verify', auth, requireRole('investor'), async (req, res) => {
  try {
    const { investor_rating, investor_feedback, property_matches_listing } = req.body;
    const result = await db.query(
      `UPDATE inspections SET investor_confirmed=TRUE, investor_rating=$1,
       investor_feedback=$2, property_matches_listing=$3,
       status='completed', completed_at=NOW()
       WHERE id=$4 AND investor_id=$5 RETURNING *`,
      [investor_rating, investor_feedback, property_matches_listing, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: '​​​​​​​​​​​​​​​​

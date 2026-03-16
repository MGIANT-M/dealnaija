const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(auth, requireRole('admin'));

router.get('/metrics', async (req, res) => {
  try {
    const [users, properties, deals, inspections] = await Promise.all([
      db.query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN role='agent' THEN 1 ELSE 0 END) as agents,
        SUM(CASE WHEN role='investor' THEN 1 ELSE 0 END) as investors
        FROM users`),
      db.query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='sold' THEN 1 ELSE 0 END) as sold
        FROM properties`),
      db.query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN stage='deal_closed' THEN 1 ELSE 0 END) as closed,
        SUM(COALESCE(agreed_price,0)) as total_volume FROM deals`),
      db.query(`SELECT COUNT(*) as total FROM inspections`)
    ]);
    res.json({
      users: users.rows[0],
      properties: properties.rows[0],
      deals: deals.rows[0],
      inspections: inspections.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/agents/pending', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, agency_name, cac_number, created_at
       FROM users WHERE role='agent' AND is_approved=FALSE
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending agents' });
  }
});

router.put('/agents/:id/approve', async (req, res) => {
  try {
    await db.query(
      `UPDATE users SET is_approved=TRUE WHERE id=$1 AND role='agent'`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve agent' });
  }
});

router.get('/properties/pending', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.full_name as agent_name, u.email as agent_email,
        (SELECT image_url FROM property_images
         WHERE property_id=p.id AND is_primary=TRUE LIMIT 1) as primary_image
      FROM properties p JOIN users u ON p.agent_id=u.id
      WHERE p.status='pending' ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending properties' });
  }
});

router.put('/properties/:id/status', async (req, res) => {
  try {
    const { status, verification_level, admin_notes } = req.body;
    const result = await db.query(
      `UPDATE properties SET status=$1,
       verification_level=COALESCE($2, verification_level),
       admin_notes=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, verification_level, admin_notes, req.params.id]
    );
    if (status === 'approved' && verification_level === 'document_verified') {
      await db.query(
        `UPDATE users SET verified_listings_count = verified_listings_count + 1
         WHERE id=$1`,
        [result.rows[0].agent_id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property status' });
  }
});

router.put('/users/:id/deactivate', async (req, res) => {
  try {
    await db.query(`UPDATE users SET is_active=FALSE WHERE id=$1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;

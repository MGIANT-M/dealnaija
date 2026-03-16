const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, full_name, agency_name, reputation_score, deals_closed_count,
             verified_listings_count, total_commission_earned, referral_count, avatar_url
      FROM users WHERE role = 'agent' AND is_approved = TRUE
      ORDER BY deals_closed_count DESC, reputation_score DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { full_name, phone, agency_name, bio, avatar_url } = req.body;
    const result = await db.query(
      `UPDATE users SET full_name=$1, phone=$2, agency_name=$3, bio=$4, avatar_url=$5, updated_at=NOW()
       WHERE id=$6 RETURNING id, email, full_name, phone, agency_name, bio, avatar_url`,
      [full_name, phone, agency_name, bio, avatar_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

router.post('/commission-calc', (req, res) => {
  const { price, commission_pct, co_broker_pct } = req.body;
  const total = price * (commission_pct / 100);
  const coBroker = co_broker_pct ? price * (co_broker_pct / 100) : 0;
  const agent = total - coBroker;
  res.json({ total_commission: total, agent_share: agent, co_broker_share: coBroker });
});

module.exports = router;

const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, requireRole('agent'), async (req, res) => {
  try {
    const { property_id, investor_id, co_broker_id, stage = 'inquiry_received' } = req.body;
    const result = await db.query(
      `INSERT INTO deals (property_id, agent_id, investor_id, co_broker_id, stage)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [property_id, req.user.id, investor_id, co_broker_id, stage]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

router.put('/:id/stage', auth, requireRole('agent'), async (req, res) => {
  try {
    const { stage, agreed_price } = req.body;
    const result = await db.query(
      `UPDATE deals SET stage=$1, agreed_price=$2, updated_at=NOW()
       WHERE id=$3 AND agent_id=$4 RETURNING *`,
      [stage, agreed_price, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Deal not found' });
    if (stage === 'deal_closed') {
      const deal = result.rows[0];
      const prop = await db.query(
        'SELECT agent_commission_pct, co_broker_commission_pct FROM properties WHERE id=$1',
        [deal.property_id]
      );
      const p = prop.rows[0];
      const commission = agreed_price * (p.agent_commission_pct / 100);
      const coBrokerComm = deal.co_broker_id ? agreed_price * (p.co_broker_commission_pct / 100) : 0;
      await db.query(
        `UPDATE deals SET agent_commission_amount=$1, co_broker_commission_amount=$2 WHERE id=$3`,
        [commission, coBrokerComm, deal.id]
      );
      await db.query(
        `UPDATE users SET deals_closed_count = deals_closed_count + 1,
         total_commission_earned = total_commission_earned + $1 WHERE id=$2`,
        [commission, req.user.id]
      );
      await db.query(`UPDATE properties SET status='sold' WHERE id=$1`, [deal.property_id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

router.get('/my-deals', auth, async (req, res) => {
  try {
    const field = req.user.role === 'agent' ? 'agent_id' : 'investor_id';
    const result = await db.query(
      `SELECT d.*, p.title as property_title, p.city, p.state
       FROM deals d JOIN properties p ON d.property_id=p.id
       WHERE d.${field}=$1 ORDER BY d.updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

module.exports = router;

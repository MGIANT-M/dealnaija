const express = require('express');
const db = require('../db');
const { auth, requireRole, requireApproved } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { state, city, min_price, max_price, seller_type,
            verification_level, distressed, page = 1, limit = 20, sort = 'newest' } = req.query;
    let conditions = ["p.status = 'approved'"];
    let params = [];
    let idx = 1;
    if (state) { conditions.push(`p.state ILIKE $${idx++}`); params.push(`%${state}%`); }
    if (city) { conditions.push(`p.city ILIKE $${idx++}`); params.push(`%${city}%`); }
    if (min_price) { conditions.push(`p.price >= $${idx++}`); params.push(parseFloat(min_price)); }
    if (max_price) { conditions.push(`p.price <= $${idx++}`); params.push(parseFloat(max_price)); }
    if (seller_type) { conditions.push(`p.seller_type = $${idx++}`); params.push(seller_type); }
    if (verification_level) { conditions.push(`p.verification_level = $${idx++}`); params.push(verification_level); }
    if (distressed === 'true') { conditions.push(`p.distressed_deal = TRUE`); }
    const orderMap = {
      newest: 'p.created_at DESC', price_asc: 'p.price ASC',
      price_desc: 'p.price DESC', trust: 'p.trust_score DESC'
    };
    const orderBy = orderMap[sort] || 'p.created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    const query = `
      SELECT p.id, p.title, p.state, p.city, p.price, p.land_size, p.size_unit,
             p.seller_type, p.verification_level, p.trust_score, p.distressed_deal,
             p.discount_percentage, p.views_count, p.saves_count, p.co_broker_enabled,
             p.co_broker_commission_pct, p.created_at,
             u.full_name as agent_name, u.agency_name, u.reputation_score as agent_reputation,
             (SELECT image_url FROM property_images
              WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM properties p JOIN users u ON p.agent_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx++}`;
    const countQuery = `SELECT COUNT(*) FROM properties p WHERE ${conditions.join(' AND ')}`;
    const [results, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    res.json({
      properties: results.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.title, p.state, p.city, p.price, p.land_size, p.size_unit,
             p.seller_type, p.verification_level, p.trust_score, p.distressed_deal,
             p.discount_percentage, u.full_name as agent_name,
             (SELECT image_url FROM property_images
              WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM properties p JOIN users u ON p.agent_id = u.id
      WHERE p.status = 'approved'
      ORDER BY p.trust_score DESC, p.views_count DESC LIMIT 8`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured properties' });
  }
});

router.get('/agent/my-listings', auth, requireRole('agent'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*,
        (SELECT image_url FROM property_images
         WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM inspections WHERE property_id = p.id) as inspection_count,
        (SELECT COUNT(*) FROM deals WHERE property_id = p.id) as deal_count
      FROM properties p WHERE p.agent_id = $1
      ORDER BY p.created_at DESC`, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/saved/list', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.title, p.state, p.city, p.price, p.land_size, p.size_unit,
             p.verification_level, p.trust_score,
             (SELECT image_url FROM property_images
              WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM saved_properties sp JOIN properties p ON sp.property_id = p.id
      WHERE sp.user_id = $1 ORDER BY sp.created_at DESC`, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved properties' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.full_name as agent_name, u.agency_name,
             u.phone as agent_phone, u.reputation_score as agent_reputation,
             u.deals_closed_count as agent_deals_closed,
             u.referral_code as agent_referral_code
      FROM properties p JOIN users u ON p.agent_id = u.id
      WHERE p.id = $1 AND p.status = 'approved'`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Property not found' });
    const images = await db.query(
      'SELECT * FROM property_images WHERE property_id = $1 ORDER BY sort_order',
      [req.params.id]
    );
    await db.query(
      'UPDATE properties SET views_count = views_count + 1 WHERE id = $1',
      [req.params.id]
    );
    res.json({ ...result.rows[0], images: images.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

router.post('/', auth, requireRole('agent'), requireApproved, async (req, res) => {
  try {
    const {
      title, description, seller_type, address, city, state, lga,
      latitude, longitude, land_size, size_unit, price, price_negotiable,
      distressed_deal, discount_percentage, title_document,
      has_survey_plan, has_deed_of_assignment, has_cof_o,
      inspection_instructions, co_broker_enabled,
      co_broker_commission_pct, agent_commission_pct, images = []
    } = req.body;
    const result = await db.query(`
      INSERT INTO properties (
        agent_id, title, description, seller_type, address, city, state, lga,
        latitude, longitude, land_size, size_unit, price, price_negotiable,
        distressed_deal, discount_percentage, title_document,
        has_survey_plan, has_deed_of_assignment, has_cof_o,
        inspection_instructions, co_broker_enabled,
        co_broker_commission_pct, agent_commission_pct
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      RETURNING *`,
      [req.user.id, title, description, seller_type, address, city, state, lga,
       latitude, longitude, land_size, size_unit, price, price_negotiable,
       distressed_deal, discount_percentage, title_document,
       has_survey_plan, has_deed_of_assignment, has_cof_o,
       inspection_instructions, co_broker_enabled,
       co_broker_commission_pct || 2.5, agent_commission_pct || 5.0]);
    const property = result.rows[0];
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          'INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES ($1,$2,$3,$4)',
          [property.id, images[i], i === 0, i]
        );
      }
    }
    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.post('/:id/save', auth, async (req, res) => {
  try {
    await db.query(
      'INSERT INTO saved_properties (user_id, property_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.id]
    );
    await db.query(
      'UPDATE properties SET saves_count = saves_count + 1 WHERE id = $1',
      [req.params.id]
    );
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save property' });
  }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateReferralCode = (name) => {
  const base = name.replace(/\s+/g, '').substring(0, 6).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${rand}`;
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role, agency_name, ref } = req.body;
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const referral_code = role === 'agent' ? generateReferralCode(full_name) : null;
    let referred_by = null;
    if (ref) {
      const referrer = await db.query('SELECT id FROM users WHERE referral_code = $1', [ref]);
      if (referrer.rows[0]) referred_by = referrer.rows[0].id;
    }
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, referral_code, referred_by, agency_name, is_approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, email, full_name, role, referral_code, is_approved`,
      [email, password_hash, full_name, phone, role, referral_code, referred_by, agency_name, role === 'investor']
    );
    const user = result.rows[0];
    if (referred_by) {
      await db.query(`INSERT INTO referrals (referrer_id, referred_id, referral_code) VALUES ($1,$2,$3)`, [referred_by, user.id, ref]);
      await db.query(`UPDATE users SET referral_count = referral_count + 1 WHERE id = $1`, [referred_by]);
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      'SELECT id, email, password_hash, full_name, role, is_approved, is_active, avatar_url, referral_code FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error​​​​​​​​​​​​​​​​

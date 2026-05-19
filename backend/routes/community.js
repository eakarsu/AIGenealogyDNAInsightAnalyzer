/*
 * routes/community.js — Community / collaboration threads.
 *
 * Pass 5 addition: closes the audit "no community forums (connect users with
 * shared ancestors)" non-AI gap. Mechanical CRUD over additive tables. Threads
 * are scoped by an optional surname / location / haplogroup tag so users can
 * find shared interests.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_threads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      surname_tag TEXT,
      location_tag TEXT,
      haplogroup_tag TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_threads_surname ON community_threads(surname_tag);
    CREATE INDEX IF NOT EXISTS idx_threads_location ON community_threads(location_tag);
    CREATE INDEX IF NOT EXISTS idx_threads_haplogroup ON community_threads(haplogroup_tag);

    CREATE TABLE IF NOT EXISTS community_replies (
      id SERIAL PRIMARY KEY,
      thread_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_replies_thread ON community_replies(thread_id);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });
router.use(authenticateToken);

router.get('/threads', async (req, res) => {
  try {
    const { surname, location, haplogroup, search } = req.query;
    const clauses = []; const params = [];
    if (surname) { params.push(surname); clauses.push(`surname_tag = $${params.length}`); }
    if (location) { params.push(location); clauses.push(`location_tag = $${params.length}`); }
    if (haplogroup) { params.push(haplogroup); clauses.push(`haplogroup_tag = $${params.length}`); }
    if (search) { params.push(`%${search}%`); clauses.push(`(title ILIKE $${params.length} OR body ILIKE $${params.length})`); }
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const r = await pool.query(`SELECT * FROM community_threads ${where} ORDER BY created_at DESC LIMIT 100`, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/threads', async (req, res) => {
  try {
    const { title, body, surname_tag = null, location_tag = null, haplogroup_tag = null } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'title and body required' });
    const r = await pool.query(
      `INSERT INTO community_threads (user_id, title, body, surname_tag, location_tag, haplogroup_tag) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, title, body, surname_tag, location_tag, haplogroup_tag]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/threads/:id', async (req, res) => {
  try {
    const t = await pool.query(`SELECT * FROM community_threads WHERE id=$1`, [req.params.id]);
    if (t.rowCount === 0) return res.status(404).json({ error: 'not found' });
    const replies = await pool.query(`SELECT * FROM community_replies WHERE thread_id=$1 ORDER BY created_at ASC`, [req.params.id]);
    res.json({ thread: t.rows[0], replies: replies.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/threads/:id/replies', async (req, res) => {
  try {
    const { body } = req.body || {};
    if (!body) return res.status(400).json({ error: 'body required' });
    const r = await pool.query(
      `INSERT INTO community_replies (thread_id, user_id, body) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, req.user.id, body]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

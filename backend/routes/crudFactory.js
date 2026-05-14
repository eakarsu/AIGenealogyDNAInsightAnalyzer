const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const ALLOWED_TABLES = [
  'ethnicity_analyses',
  'ancestors',
  'health_risks',
  'migration_patterns',
  'family_relationships',
  'haplogroups',
  'genetic_traits',
  'ancestor_timelines',
  'cultural_heritage',
  'surname_origins',
  'dna_matches',
  'genealogy_documents',
  'heritage_recipes',
  'heritage_reports',
  'ancient_ancestry',
];

function sanitizeColumnName(col) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) {
    throw new Error(`Invalid column name: ${col}`);
  }
  return col;
}

function createCrudRouter(tableName, aiPromptFn) {
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`Table "${tableName}" is not in the allowed list.`);
  }

  const router = express.Router();

  // Add user_id column if not already present (idempotent migration)
  pool.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS user_id INTEGER`).catch(() => {});

  // GET all — scoped to current user
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${tableName} WHERE user_id = $1`,
        [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY id LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      );
      res.json({
        data: result.rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one — scoped to current user
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const rawKeys = Object.keys(req.body).filter((k) => k !== 'user_id');
      const sanitizedKeys = rawKeys.map(sanitizeColumnName);
      const values = rawKeys.map((k) => req.body[k]);

      sanitizedKeys.push('user_id');
      values.push(req.user.id);

      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const columns = sanitizedKeys.join(', ');

      const result = await pool.query(
        `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update — scoped to current user
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const rawKeys = Object.keys(req.body).filter((k) => k !== 'user_id');
      const sanitizedKeys = rawKeys.map(sanitizeColumnName);
      const values = rawKeys.map((k) => req.body[k]);

      const setClause = sanitizedKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      values.push(req.params.id);
      values.push(req.user.id);

      const result = await pool.query(
        `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE — scoped to current user
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST AI analyze — rate limited
  router.post('/:id/analyze', authenticateToken, aiRateLimiter, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      const item = result.rows[0];
      const prompt = aiPromptFn(item);
      const aiResult = await queryAI(prompt);

      // Persist AI result
      const saved = await pool.query(
        `INSERT INTO ai_results (user_id, tool_name, input_summary, result, model) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          req.user.id,
          tableName,
          JSON.stringify(item).slice(0, 500),
          typeof aiResult.result === 'string' ? aiResult.result : JSON.stringify(aiResult.result),
          aiResult.model || 'unknown',
        ]
      );

      res.json({ item, ai_analysis: aiResult, saved_id: saved.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;

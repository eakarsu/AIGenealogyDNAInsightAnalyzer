/*
 * routes/familyTree.js — Mechanical family-tree closure / projection.
 *
 * Pass 5 addition: closes the audit "no family tree visualization" non-AI gap
 * (closure / projection is the data side; FE viz remains a separate concern).
 *
 * Build a parent-child / spouse graph and answer:
 *  - direct relationship between two people (using the standard cousin-degree
 *    formula via lowest common ancestor).
 *  - subgraph descendants / ancestors with depth limit.
 *
 * No AI calls; pure graph computation. Reuses the existing pool + JWT auth.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tree_people (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      birth_year INTEGER,
      death_year INTEGER,
      sex TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS tree_edges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      relation_type TEXT NOT NULL,
      person_a INTEGER NOT NULL,
      person_b INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tree_edges_user ON tree_edges(user_id);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });
router.use(authenticateToken);

// CRUD people
router.get('/people', async (req, res) => {
  try { res.json((await pool.query(`SELECT * FROM tree_people WHERE user_id=$1 ORDER BY name`, [req.user.id])).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/people', async (req, res) => {
  try {
    const { name, birth_year = null, death_year = null, sex = null, notes = null } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const r = await pool.query(`INSERT INTO tree_people (user_id, name, birth_year, death_year, sex, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, name, birth_year, death_year, sex, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CRUD edges (relation_type: parent_of | spouse_of)
router.post('/edges', async (req, res) => {
  try {
    const { relation_type, person_a, person_b } = req.body || {};
    if (!['parent_of', 'spouse_of'].includes(relation_type)) return res.status(400).json({ error: 'relation_type must be parent_of or spouse_of' });
    const r = await pool.query(`INSERT INTO tree_edges (user_id, relation_type, person_a, person_b) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, relation_type, person_a, person_b]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/edges', async (req, res) => {
  try { res.json((await pool.query(`SELECT * FROM tree_edges WHERE user_id=$1`, [req.user.id])).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Helpers: find ancestors / descendants of a person within depth N
async function loadEdges(userId) {
  const r = await pool.query(`SELECT * FROM tree_edges WHERE user_id=$1 AND relation_type='parent_of'`, [userId]);
  const childToParents = new Map();
  const parentToChildren = new Map();
  for (const e of r.rows) {
    if (!childToParents.has(e.person_b)) childToParents.set(e.person_b, []);
    childToParents.get(e.person_b).push(e.person_a);
    if (!parentToChildren.has(e.person_a)) parentToChildren.set(e.person_a, []);
    parentToChildren.get(e.person_a).push(e.person_b);
  }
  return { childToParents, parentToChildren };
}

function bfsAncestors(start, childToParents, maxDepth) {
  const out = new Map(); // id -> depth (1=parent)
  const q = [{ id: start, d: 0 }];
  while (q.length) {
    const { id, d } = q.shift();
    if (d > maxDepth) continue;
    const parents = childToParents.get(id) || [];
    for (const p of parents) {
      if (!out.has(p) || out.get(p) > d + 1) {
        out.set(p, d + 1);
        q.push({ id: p, d: d + 1 });
      }
    }
  }
  return out;
}

router.get('/ancestors/:personId', async (req, res) => {
  try {
    const depth = parseInt(req.query.depth || '6', 10);
    const { childToParents } = await loadEdges(req.user.id);
    const anc = bfsAncestors(parseInt(req.params.personId, 10), childToParents, depth);
    res.json([...anc.entries()].map(([id, d]) => ({ id, depth: d })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/descendants/:personId', async (req, res) => {
  try {
    const depth = parseInt(req.query.depth || '6', 10);
    const { parentToChildren } = await loadEdges(req.user.id);
    const out = new Map();
    const q = [{ id: parseInt(req.params.personId, 10), d: 0 }];
    while (q.length) {
      const { id, d } = q.shift();
      if (d > depth) continue;
      for (const c of parentToChildren.get(id) || []) {
        if (!out.has(c) || out.get(c) > d + 1) { out.set(c, d + 1); q.push({ id: c, d: d + 1 }); }
      }
    }
    res.json([...out.entries()].map(([id, d]) => ({ id, depth: d })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Compute relationship between two people via lowest common ancestor.
router.get('/relationship', async (req, res) => {
  try {
    const a = parseInt(req.query.a, 10);
    const b = parseInt(req.query.b, 10);
    if (!a || !b) return res.status(400).json({ error: 'a and b query params required' });
    const { childToParents } = await loadEdges(req.user.id);
    const aAnc = bfsAncestors(a, childToParents, 12); aAnc.set(a, 0);
    const bAnc = bfsAncestors(b, childToParents, 12); bAnc.set(b, 0);
    let lca = null, dA = Infinity, dB = Infinity;
    for (const [id, d] of aAnc.entries()) {
      if (bAnc.has(id)) {
        const total = d + bAnc.get(id);
        if (total < dA + dB) { lca = id; dA = d; dB = bAnc.get(id); }
      }
    }
    if (lca == null) return res.json({ related: false });
    // Cousin classification:
    // dA=0: b is ancestor of a (parent / grandparent / ...)
    // direct line: |dA-dB|>0 and one of them 0
    let label;
    if (dA === 0) label = bDepthLabel(dB, 'descendant');
    else if (dB === 0) label = bDepthLabel(dA, 'ancestor');
    else {
      const cousinDeg = Math.min(dA, dB) - 1;
      const removed = Math.abs(dA - dB);
      if (cousinDeg === 0 && removed === 0) label = 'siblings';
      else if (cousinDeg === 0) label = removed === 1 ? 'aunt/uncle or niece/nephew' : `${ordinal(removed)} grand-aunt/uncle or grand-niece/nephew`;
      else label = `${ordinal(cousinDeg)} cousin${removed ? ` ${removed}× removed` : ''}`;
    }
    res.json({ related: true, lca, depth_to_a: dA, depth_to_b: dB, label });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function bDepthLabel(d, kind) {
  if (kind === 'descendant') {
    if (d === 1) return 'parent';
    if (d === 2) return 'grandparent';
    if (d === 3) return 'great-grandparent';
    return `${d - 2}× great-grandparent`;
  }
  if (d === 1) return 'child';
  if (d === 2) return 'grandchild';
  if (d === 3) return 'great-grandchild';
  return `${d - 2}× great-grandchild`;
}
function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

module.exports = router;

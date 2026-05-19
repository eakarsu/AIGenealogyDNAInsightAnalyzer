// Custom Views router — 4 endpoints for DNA / genealogy insights
//  - GET /ethnicity-breakdown    (VIZ 1: ethnicity donut)
//  - GET /relationship-heatmap   (VIZ 2: DNA matches relationship heatmap)
//  - POST /ancestry-pdf          (NON-VIZ 1: ancestry insight PDF generator)
//  - /matching-rules*            (NON-VIZ 2: DNA matching rules CRUD)
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// In-memory storage for DNA matching rules (cM thresholds + relationship rules).
// Scoped per-user so tests + the user remain isolated. Persists for process lifetime.
const matchingRulesByUser = new Map();
let nextRuleId = 1;

function getUserRules(userId) {
  if (!matchingRulesByUser.has(userId)) {
    matchingRulesByUser.set(userId, [
      { id: nextRuleId++, relationship: 'Parent / Child', min_cm: 3300, max_cm: 3720, priority: 1, notes: 'Full first-degree' },
      { id: nextRuleId++, relationship: 'Full Sibling', min_cm: 2300, max_cm: 3900, priority: 2, notes: 'Avg ~2600 cM' },
      { id: nextRuleId++, relationship: 'Half Sibling / Aunt-Uncle / Grandparent', min_cm: 1300, max_cm: 2300, priority: 3, notes: 'Second-degree range' },
      { id: nextRuleId++, relationship: 'First Cousin', min_cm: 553, max_cm: 1225, priority: 4, notes: 'Third-degree' },
      { id: nextRuleId++, relationship: 'Second Cousin', min_cm: 75, max_cm: 425, priority: 5, notes: 'Fifth-degree' },
      { id: nextRuleId++, relationship: 'Distant Cousin', min_cm: 6, max_cm: 75, priority: 6, notes: 'Beyond 3rd cousin' },
    ]);
  }
  return matchingRulesByUser.get(userId);
}

// ---- VIZ 1: Ethnicity breakdown donut -------------------------------------
router.get('/ethnicity-breakdown', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT region, sub_region, percentage, confidence
         FROM ethnicity_analyses
        WHERE user_id = $1
        ORDER BY percentage DESC NULLS LAST`,
      [req.user.id]
    );
    const rows = result.rows;
    const total = rows.reduce((sum, r) => sum + Number(r.percentage || 0), 0);
    const byRegion = {};
    for (const r of rows) {
      const key = r.region || 'Unknown';
      byRegion[key] = (byRegion[key] || 0) + Number(r.percentage || 0);
    }
    const palette = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16', '#0ea5e9', '#f97316'];
    const segments = Object.entries(byRegion)
      .sort((a, b) => b[1] - a[1])
      .map(([region, pct], i) => ({
        region,
        percentage: Number(pct.toFixed(2)),
        color: palette[i % palette.length],
      }));
    res.json({
      type: 'donut',
      title: 'Ethnicity Breakdown',
      total_percentage: Number(total.toFixed(2)),
      region_count: segments.length,
      detail_count: rows.length,
      segments,
      details: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- VIZ 2: DNA matches relationship heatmap -----------------------------
router.get('/relationship-heatmap', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT match_name, shared_cm, predicted_relationship, confidence
         FROM dna_matches
        WHERE user_id = $1`,
      [req.user.id]
    );
    const rows = result.rows;

    // Y axis: cM buckets. X axis: estimated relationship buckets.
    const cmBuckets = [
      { label: '0-50 cM',     min: 0,    max: 50 },
      { label: '50-200 cM',   min: 50,   max: 200 },
      { label: '200-600 cM',  min: 200,  max: 600 },
      { label: '600-1300 cM', min: 600,  max: 1300 },
      { label: '1300-2300 cM',min: 1300, max: 2300 },
      { label: '2300+ cM',    min: 2300, max: Infinity },
    ];
    const relBuckets = ['Parent/Child', 'Sibling', '2nd-degree', '1st Cousin', '2nd Cousin', 'Distant'];

    function bucketForRelationship(rel) {
      const s = String(rel || '').toLowerCase();
      if (s.includes('parent') || s.includes('child')) return 'Parent/Child';
      if (s.includes('sibling')) return 'Sibling';
      if (s.includes('aunt') || s.includes('uncle') || s.includes('grandparent') || s.includes('half')) return '2nd-degree';
      if (s.includes('1st') || s.includes('first cousin')) return '1st Cousin';
      if (s.includes('2nd') || s.includes('second cousin')) return '2nd Cousin';
      return 'Distant';
    }
    function bucketForCm(cm) {
      const v = Number(cm || 0);
      return cmBuckets.find((b) => v >= b.min && v < b.max) || cmBuckets[0];
    }

    // Initialize matrix: rows=cmBuckets, cols=relBuckets, value=count.
    const matrix = cmBuckets.map((rowB) =>
      relBuckets.map((relLabel) => ({ cm_bucket: rowB.label, relationship: relLabel, count: 0 }))
    );

    let max = 0;
    for (const r of rows) {
      const rb = bucketForCm(r.shared_cm);
      const rIdx = cmBuckets.indexOf(rb);
      const cb = bucketForRelationship(r.predicted_relationship);
      const cIdx = relBuckets.indexOf(cb);
      if (rIdx >= 0 && cIdx >= 0) {
        matrix[rIdx][cIdx].count += 1;
        if (matrix[rIdx][cIdx].count > max) max = matrix[rIdx][cIdx].count;
      }
    }

    res.json({
      type: 'heatmap',
      title: 'DNA Matches: cM × Estimated Relationship',
      x_axis: relBuckets,
      y_axis: cmBuckets.map((b) => b.label),
      max_cell_count: max,
      match_count: rows.length,
      matrix,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- NON-VIZ 1: Ancestry insight PDF (plain text body, PDF-ish content) ---
router.post('/ancestry-pdf', authenticateToken, async (req, res) => {
  try {
    const { include_health = false, title = 'Ancestry Insight Report' } = req.body || {};
    const eth = await pool.query(
      `SELECT region, sub_region, percentage, confidence
         FROM ethnicity_analyses WHERE user_id = $1 ORDER BY percentage DESC NULLS LAST`,
      [req.user.id]
    );
    const anc = await pool.query(
      `SELECT name, birth_year, death_year, birth_place, relationship
         FROM ancestors WHERE user_id = $1 ORDER BY birth_year NULLS LAST`,
      [req.user.id]
    );
    const matches = await pool.query(
      `SELECT match_name, shared_cm, predicted_relationship
         FROM dna_matches WHERE user_id = $1 ORDER BY shared_cm DESC NULLS LAST LIMIT 5`,
      [req.user.id]
    );
    let healthLines = [];
    if (include_health) {
      const hr = await pool.query(
        `SELECT condition, gene, risk_level FROM health_risks WHERE user_id = $1 LIMIT 10`,
        [req.user.id]
      );
      healthLines = hr.rows.map((r) => `  - ${r.condition} (${r.gene}) — risk: ${r.risk_level}`);
    }

    const now = new Date().toISOString();
    const lines = [];
    lines.push(`%PDF-1.4-LIKE-PLAIN-TEXT  (mock)`);
    lines.push(`Title: ${title}`);
    lines.push(`Generated: ${now}`);
    lines.push(`User: ${req.user.email || req.user.id}`);
    lines.push('');
    lines.push('== Ethnicity Summary ==');
    eth.rows.forEach((r) =>
      lines.push(`  - ${r.region} / ${r.sub_region}: ${r.percentage}% (${r.confidence})`)
    );
    lines.push('');
    lines.push('== Top Ancestors ==');
    anc.rows.slice(0, 10).forEach((a) =>
      lines.push(`  - ${a.name} (${a.birth_year || '?'}-${a.death_year || '?'}) ${a.birth_place || ''} [${a.relationship || ''}]`)
    );
    lines.push('');
    lines.push('== Top DNA Matches ==');
    matches.rows.forEach((m) =>
      lines.push(`  - ${m.match_name}: ${m.shared_cm} cM (${m.predicted_relationship})`)
    );
    if (include_health) {
      lines.push('');
      lines.push('== Health Risk Highlights ==');
      lines.push(...healthLines);
    }
    lines.push('');
    lines.push('-- End of Report --');

    const body = lines.join('\n');
    res.json({
      title,
      generated_at: now,
      page_count: Math.max(1, Math.ceil(body.length / 1800)),
      ethnicity_rows: eth.rows.length,
      ancestor_rows: anc.rows.length,
      match_rows: matches.rows.length,
      include_health,
      filename: `ancestry-insight-${Date.now()}.pdf.txt`,
      body,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- NON-VIZ 2: DNA matching rules editor (CRUD) --------------------------
router.get('/matching-rules', authenticateToken, (req, res) => {
  const rules = getUserRules(req.user.id);
  res.json({ data: rules, count: rules.length });
});

router.post('/matching-rules', authenticateToken, (req, res) => {
  try {
    const { relationship, min_cm, max_cm, priority, notes } = req.body || {};
    if (!relationship) return res.status(400).json({ error: 'relationship is required' });
    if (Number(min_cm) < 0 || Number(max_cm) < 0) {
      return res.status(400).json({ error: 'cM thresholds must be non-negative' });
    }
    if (Number(min_cm) >= Number(max_cm)) {
      return res.status(400).json({ error: 'min_cm must be < max_cm' });
    }
    const rule = {
      id: nextRuleId++,
      relationship: String(relationship),
      min_cm: Number(min_cm) || 0,
      max_cm: Number(max_cm) || 0,
      priority: Number(priority) || 99,
      notes: notes ? String(notes) : '',
    };
    const rules = getUserRules(req.user.id);
    rules.push(rule);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/matching-rules/:id', authenticateToken, (req, res) => {
  const rules = getUserRules(req.user.id);
  const id = parseInt(req.params.id, 10);
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const cur = rules[idx];
  const patch = req.body || {};
  const next = {
    ...cur,
    relationship: patch.relationship != null ? String(patch.relationship) : cur.relationship,
    min_cm: patch.min_cm != null ? Number(patch.min_cm) : cur.min_cm,
    max_cm: patch.max_cm != null ? Number(patch.max_cm) : cur.max_cm,
    priority: patch.priority != null ? Number(patch.priority) : cur.priority,
    notes: patch.notes != null ? String(patch.notes) : cur.notes,
  };
  if (next.min_cm >= next.max_cm) {
    return res.status(400).json({ error: 'min_cm must be < max_cm' });
  }
  rules[idx] = next;
  res.json(next);
});

router.delete('/matching-rules/:id', authenticateToken, (req, res) => {
  const rules = getUserRules(req.user.id);
  const id = parseInt(req.params.id, 10);
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const removed = rules.splice(idx, 1)[0];
  res.json({ message: 'Deleted', removed });
});

module.exports = router;

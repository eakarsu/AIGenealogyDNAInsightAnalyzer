// Health + ancestry insights linking genetic findings to geographic
// populations, with sensitive-finding handling.
// Audit: batch_04.md / AIGenealogyDNAInsightAnalyzer / Custom Feature Suggestions #3,#4
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../openrouter');

const router = express.Router();
router.use(authenticateToken);

function parseJSON(t) {
  try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: t };
}

// POST /api/health-ancestry/explain
// Body: { focus_area?, target_risk_ids? }
router.post('/explain', async (req, res) => {
  try {
    const { focus_area, target_risk_ids = [] } = req.body || {};

    let risks = { rows: [] };
    let ethnicity = { rows: [] };
    let haplogroups = { rows: [] };
    try {
      risks = await pool.query(
        `SELECT * FROM health_risks WHERE user_id = $1 ${target_risk_ids.length ? 'AND id = ANY($2)' : ''} LIMIT 50`,
        target_risk_ids.length ? [req.user.id, target_risk_ids] : [req.user.id]
      );
    } catch (_) {}
    try {
      ethnicity = await pool.query(`SELECT * FROM ethnicity WHERE user_id = $1`, [req.user.id]);
    } catch (_) {}
    try {
      haplogroups = await pool.query(`SELECT * FROM haplogroups WHERE user_id = $1`, [req.user.id]);
    } catch (_) {}

    const systemPrompt = `You are a careful genetic-health communicator. Translate genetic risk findings into
plain language, link them to the user's geographic ancestry context, and clearly differentiate "increased
relative risk" from "diagnostic." For sensitive findings (BRCA, Huntington's, non-paternity), recommend counselor
referral. Return STRICT JSON only.`;

    const userPrompt = `Focus area: ${focus_area || 'general'}
Health risks: ${JSON.stringify(risks.rows.slice(0, 20))}
Ethnicity breakdown: ${JSON.stringify(ethnicity.rows)}
Haplogroups: ${JSON.stringify(haplogroups.rows)}

Return JSON:
{
  "summary": "...",
  "explanations": [
    {
      "condition_or_trait": "string",
      "plain_language": "string",
      "relative_risk_descriptor": "average|slightly_elevated|elevated|substantially_elevated",
      "geographic_population_context": "string",
      "actionable_steps": ["..."],
      "is_sensitive": false
    }
  ],
  "sensitive_findings_protocol": { "found": false, "recommended_action": "string", "counselor_referral_note": "string" },
  "lifestyle_guidance": ["..."],
  "follow_up_screenings_to_discuss_with_doctor": ["..."],
  "disclaimer": "Educational only; not medical diagnosis. Discuss with healthcare provider."
}`;

    const raw = await queryAI(userPrompt, systemPrompt);
    const text = typeof raw === 'string' ? raw : (raw && raw.result) || '';
    res.json({ risk_count: risks.rows.length, insights: parseJSON(text) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/health-ancestry/sensitive-flags
router.get('/sensitive-flags', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, name, severity FROM health_risks WHERE user_id = $1 AND severity IN ('high','critical') LIMIT 50`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

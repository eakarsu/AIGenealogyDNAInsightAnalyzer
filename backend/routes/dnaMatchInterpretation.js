// Multi-modal DNA + document fusion combining matches, census, ship
// manifests, land deeds into one narrative — starts with DNA match
// interpretation.
// Audit: batch_04.md / AIGenealogyDNAInsightAnalyzer / Custom Feature Suggestions #1,#2
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

// POST /api/dna-match-interpret/explain
// Body: { match_id, my_haplogroup?, focus? }
router.post('/explain', async (req, res) => {
  try {
    const { match_id, focus = 'relationship_inference' } = req.body || {};
    if (!match_id) return res.status(400).json({ error: 'match_id required' });

    let match = null;
    let ancestors = { rows: [] };
    let docs = { rows: [] };
    try {
      const r = await pool.query(`SELECT * FROM dna_matches WHERE id = $1`, [match_id]);
      match = r.rows[0] || null;
    } catch (_) {}
    try {
      ancestors = await pool.query(
        `SELECT id, name, birth_year, death_year FROM ancestors WHERE user_id = $1 LIMIT 30`,
        [req.user.id]
      );
    } catch (_) {}
    try {
      docs = await pool.query(
        `SELECT id, title, document_type, year FROM documents WHERE user_id = $1 LIMIT 30`,
        [req.user.id]
      );
    } catch (_) {}

    const systemPrompt = `You are a senior DNA genealogist. Interpret a DNA match (shared cM, segments, haplogroup overlap)
in plain language. Recommend a most-likely relationship, alternatives, and a research roadmap fusing matches with
known documents (census, ship manifest, land deeds). Return STRICT JSON only.`;

    const userPrompt = `Match record: ${JSON.stringify(match)}
Focus: ${focus}
Known ancestors: ${JSON.stringify(ancestors.rows.slice(0, 20))}
Available documents (titles): ${JSON.stringify(docs.rows.slice(0, 20))}

Return JSON:
{
  "summary": "...",
  "most_likely_relationship": "string",
  "alternative_relationships": [{ "relationship": "string", "probability_pct": 0, "reasoning": "string" }],
  "shared_segments_interpretation": "string",
  "research_roadmap": [{ "step": 1, "action": "string", "expected_evidence": "string", "archive_hint": "string" }],
  "anomalies_to_investigate": ["..."],
  "confidence_pct": 0,
  "sensitive_findings_note": "string",
  "disclaimer": "DNA interpretation is probabilistic; consult a certified genetic genealogist for surprises."
}`;

    const raw = await queryAI(userPrompt, systemPrompt);
    const text = typeof raw === 'string' ? raw : (raw && raw.result) || '';
    res.json({ match_id, interpretation: parseJSON(text) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dna-match-interpret/migration-narrative
// Body: { migration_event_ids? }
router.post('/migration-narrative', async (req, res) => {
  try {
    const { migration_event_ids = [] } = req.body || {};
    let events = { rows: [] };
    try {
      events = await pool.query(
        `SELECT * FROM migration WHERE user_id = $1 ${migration_event_ids.length ? 'AND id = ANY($2)' : ''} ORDER BY event_year ASC LIMIT 30`,
        migration_event_ids.length ? [req.user.id, migration_event_ids] : [req.user.id]
      );
    } catch (_) {}

    const systemPrompt = `You are a migration-narrative synthesizer. Weave migration events into a compelling
multigenerational story including historical context, motivations, hardships, and outcomes. Return STRICT JSON.`;

    const userPrompt = `Migration events: ${JSON.stringify(events.rows)}
Return JSON: { "narrative": "string (3-5 paragraphs)", "key_dates": [{ "year": 0, "event": "string", "context": "string" }], "historical_context": "string", "open_questions": ["..."], "disclaimer": "Narrative is interpretive." }`;

    const raw = await queryAI(userPrompt, systemPrompt);
    const text = typeof raw === 'string' ? raw : (raw && raw.result) || '';
    res.json({ event_count: events.rows.length, narrative: parseJSON(text) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

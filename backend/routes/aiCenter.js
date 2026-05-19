const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const pool = require('../db');

const router = express.Router();

// Ensure ai_results table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    tool_name TEXT,
    input_summary TEXT,
    result TEXT,
    model TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch((err) => console.error('ai_results table init error:', err.message));

// AI Center - direct AI queries for all features
const aiFeatures = [
  { id: 'ethnicity-deep-dive', name: 'Ethnicity Deep Dive', description: 'Get detailed AI analysis of any ethnic background', icon: '🌍', systemPrompt: 'You are an expert geneticist specializing in population genetics and ethnicity analysis.' },
  { id: 'ancestor-search', name: 'AI Ancestor Search', description: 'Let AI help discover potential ancestors', icon: '🔍', systemPrompt: 'You are an expert genealogist who helps people discover and research their ancestors.' },
  { id: 'health-genetics', name: 'Genetic Health Advisor', description: 'AI-powered genetic health insights', icon: '🏥', systemPrompt: 'You are a genetic counselor providing educational information about genetic health predispositions. Always remind users this is not medical advice.' },
  { id: 'migration-tracer', name: 'Migration Route Tracer', description: 'AI traces ancestral migration routes', icon: '🗺️', systemPrompt: 'You are a historical demographer specializing in human migration patterns and population movements.' },
  { id: 'relationship-calculator', name: 'DNA Relationship Calculator', description: 'AI calculates family relationships from DNA', icon: '👨‍👩‍👧‍👦', systemPrompt: 'You are a DNA relationship expert who can calculate and explain genetic relationships based on shared DNA.' },
  { id: 'haplogroup-explorer', name: 'Haplogroup Explorer', description: 'Explore ancient lineages through haplogroups', icon: '🧬', systemPrompt: 'You are an expert in human haplogroups, ancient DNA, and deep genealogy.' },
  { id: 'trait-predictor', name: 'Genetic Trait Predictor', description: 'AI predicts traits from genetic data', icon: '👁️', systemPrompt: 'You are a geneticist who explains how genes influence physical and behavioral traits.' },
  { id: 'history-contextualizer', name: 'Historical Contextualizer', description: 'AI provides historical context for ancestors', icon: '📜', systemPrompt: 'You are a historian who provides rich context about what life was like during specific time periods and locations.' },
  { id: 'culture-explorer', name: 'Cultural Heritage Explorer', description: 'Discover cultural traditions of your ancestors', icon: '🎭', systemPrompt: 'You are a cultural anthropologist who explores traditions, customs, and cultural heritage of diverse populations.' },
  { id: 'surname-researcher', name: 'Surname Researcher', description: 'AI researches surname origins and meanings', icon: '📛', systemPrompt: 'You are an onomastics expert specializing in surname etymology, history, and geographic distribution.' },
  { id: 'dna-interpreter', name: 'DNA Match Interpreter', description: 'AI interprets DNA match results', icon: '🔬', systemPrompt: 'You are a genetic genealogy expert who interprets DNA match results and helps identify family connections.' },
  { id: 'document-analyzer', name: 'Document Analyzer', description: 'AI analyzes genealogical documents', icon: '📄', systemPrompt: 'You are an expert in historical document analysis, paleography, and genealogical record interpretation.' },
  { id: 'recipe-discoverer', name: 'Heritage Recipe Discoverer', description: 'Discover recipes from your ancestral homeland', icon: '🍲', systemPrompt: 'You are a culinary historian who connects food traditions to cultural and genetic heritage.' },
  { id: 'report-generator', name: 'Heritage Report Generator', description: 'Generate comprehensive heritage reports', icon: '📊', systemPrompt: 'You are a professional genealogist who creates comprehensive, well-structured heritage reports.' },
  { id: 'ancient-origins', name: 'Ancient Origins Explorer', description: 'Explore deep ancient ancestry connections', icon: '🏛️', systemPrompt: 'You are an archaeogeneticist who connects modern DNA to ancient populations and civilizations.' },
  { id: 'family-story', name: 'Family Story Generator', description: 'AI creates narratives from family data', icon: '📖', systemPrompt: 'You are a creative writer who crafts compelling family history narratives based on genealogical data.' },
  { id: 'dna-education', name: 'DNA Science Educator', description: 'Learn about DNA and genetics basics', icon: '🎓', systemPrompt: 'You are a genetics educator who explains DNA science, inheritance patterns, and genetic genealogy concepts in accessible terms.' },
  { id: 'photo-era-analyzer', name: 'Photo Era Analyzer', description: 'AI identifies time periods from photo descriptions', icon: '📸', systemPrompt: 'You are an expert in historical photography, fashion, and material culture who can identify time periods and locations from visual descriptions.' },
];

async function saveAiResult(userId, toolName, inputSummary, result, model) {
  try {
    const saved = await pool.query(
      `INSERT INTO ai_results (user_id, tool_name, input_summary, result, model) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, toolName, inputSummary ? inputSummary.slice(0, 500) : null, result, model]
    );
    return saved.rows[0].id;
  } catch (err) {
    console.error('Failed to save AI result:', err.message);
    return null;
  }
}

// Get all AI features
router.get('/features', authenticateToken, (req, res) => {
  res.json(aiFeatures);
});

// Query specific AI feature — rate limited
router.post('/query', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { featureId, prompt } = req.body;
    const feature = aiFeatures.find(f => f.id === featureId);
    if (!feature) {
      return res.status(400).json({ error: 'Invalid AI feature' });
    }
    const result = await queryAI(prompt, feature.systemPrompt);
    const savedId = await saveAiResult(
      req.user.id,
      feature.id,
      prompt,
      typeof result.result === 'string' ? result.result : JSON.stringify(result.result),
      result.model
    );
    res.json({ feature: feature.name, ...result, saved_id: savedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// General AI query — rate limited
router.post('/general', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await queryAI(prompt);
    const savedId = await saveAiResult(
      req.user.id,
      'general',
      prompt,
      typeof result.result === 'string' ? result.result : JSON.stringify(result.result),
      result.model
    );
    res.json({ ...result, saved_id: savedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Document OCR with Vision AI — rate limited
router.post('/document-ocr', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { image_base64, mime_type, document_type } = req.body;
    if (!image_base64 || !mime_type) {
      return res.status(400).json({ error: 'image_base64 and mime_type are required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = 'anthropic/claude-3-5-sonnet-20241022';

    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      return res.status(503).json({ error: 'OpenRouter API key not configured.' });
    }

    const https = require('https');
    const body = JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a genealogy document expert. Extract all text and structured fields (names, dates, places, relationships) from this document image. Return JSON with fields: extracted_text, persons (array of {name, birth_date, death_date, location}), key_dates, locations.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mime_type, data: image_base64 },
            },
            {
              type: 'text',
              text: `Please analyze this ${document_type || 'genealogy'} document and extract all relevant information in JSON format.`,
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const ocrResult = await new Promise((resolve) => {
      const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Genealogy DNA Insight Analyzer',
        },
      };
      const req2 = https.request(options, (r) => {
        let data = '';
        r.on('data', (chunk) => { data += chunk; });
        r.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0]) {
              resolve({ success: true, content: parsed.choices[0].message.content, model: parsed.model || model });
            } else {
              resolve({ success: false, content: parsed.error?.message || 'OCR failed', model });
            }
          } catch {
            resolve({ success: false, content: 'Failed to parse OCR response', model });
          }
        });
      });
      req2.on('error', (e) => resolve({ success: false, content: e.message, model }));
      req2.write(body);
      req2.end();
    });

    if (!ocrResult.success) {
      return res.status(500).json({ error: ocrResult.content });
    }

    // Try to parse JSON from AI response
    let extractedData = {};
    try {
      const jsonMatch = ocrResult.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) extractedData = JSON.parse(jsonMatch[0]);
      else extractedData = { extracted_text: ocrResult.content };
    } catch {
      extractedData = { extracted_text: ocrResult.content };
    }

    // Auto-save to genealogy_documents table
    let docId = null;
    try {
      const docResult = await pool.query(
        `INSERT INTO genealogy_documents (user_id, document_type, title, content_summary)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          req.user.id,
          document_type || 'uploaded',
          extractedData.extracted_text ? extractedData.extracted_text.slice(0, 100) : 'OCR Document',
          JSON.stringify(extractedData).slice(0, 1000),
        ]
      );
      docId = docResult.rows[0].id;
    } catch (dbErr) {
      console.error('Failed to save OCR doc to DB:', dbErr.message);
    }

    res.json({ success: true, extracted_data: extractedData, document_id: docId, model: ocrResult.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET AI history for current user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_results WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      'SELECT * FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
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

// Helper to robustly parse JSON
function tryParseJson(text) {
  if (typeof text !== 'string') return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  try { return JSON.parse(candidate); } catch (e) { /* fallthrough */ }
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(candidate.slice(start, end + 1)); } catch { /* ignore */ }
  }
  return null;
}

// POST /dna-match-interpret — explain a DNA match's strength + likely relationship
router.post('/dna-match-interpret', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { match_name, shared_cm, shared_segments, longest_segment_cm, ethnicity_overlap } = req.body || {};
    if (!shared_cm) return res.status(400).json({ error: 'shared_cm is required' });

    const systemPrompt = 'You are a genetic genealogy expert. Interpret DNA match data and predict the most likely family relationship range. Return STRICT JSON only.';
    const prompt = `Match data:
Name: ${match_name || 'unknown'}
Total shared cM: ${shared_cm}
Shared segments: ${shared_segments || 'unknown'}
Longest segment cM: ${longest_segment_cm || 'unknown'}
Ethnicity overlap: ${ethnicity_overlap || 'unknown'}

Return JSON:
{
  "summary": "...",
  "predicted_relationships": [
    { "relationship": "string (e.g., 2nd cousin)", "probability_pct": 0, "rationale": "string" }
  ],
  "next_steps": ["..."],
  "tools_to_use": ["DNA Painter", "Shared Matches", "..."],
  "disclaimer": "Predictions are probabilistic; multiple relationships can produce the same cM range."
}`;
    const result = await queryAI(prompt, systemPrompt);
    const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
    const parsed = tryParseJson(raw) || { raw };
    await saveAiResult(req.user.id, 'dna-match-interpret', JSON.stringify(req.body).slice(0, 1000), raw, result.model);
    res.json({ feature: 'DNA Match Interpreter', parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /migration-story — synthesize haplogroup + records into a migration narrative
router.post('/migration-story', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { haplogroups = [], known_locations = [], time_periods = [], surname } = req.body || {};
    const systemPrompt = 'You are a population historian and genetic genealogist. Synthesize haplogroups, known ancestral locations, and time periods into a flowing migration narrative. Be cautious with speculation. Return JSON.';
    const prompt = `Inputs:
Haplogroups: ${JSON.stringify(haplogroups)}
Known ancestral locations: ${JSON.stringify(known_locations)}
Time periods: ${JSON.stringify(time_periods)}
Surname: ${surname || 'unspecified'}

Return JSON:
{
  "narrative": "3-5 paragraph migration story",
  "timeline": [{ "period": "string", "location": "string", "event": "string" }],
  "uncertainties": ["..."],
  "sources_to_consult": ["..."],
  "disclaimer": "Speculative; verify with documentary records."
}`;
    const result = await queryAI(prompt, systemPrompt);
    const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
    const parsed = tryParseJson(raw) || { raw };
    await saveAiResult(req.user.id, 'migration-story', JSON.stringify(req.body).slice(0, 1000), raw, result.model);
    res.json({ feature: 'Migration Story', parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /health-risk-explain — explain a genetic health finding in plain language
router.post('/health-risk-explain', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { variant, gene, condition, raw_test_phrase, ethnic_background } = req.body || {};
    if (!variant && !gene && !condition && !raw_test_phrase) {
      return res.status(400).json({ error: 'Provide at least one of variant, gene, condition, or raw_test_phrase' });
    }
    const systemPrompt = 'You are a genetic counselor explaining genetic health findings in accessible language. ALWAYS make clear this is educational, not medical advice, and recommend consulting a licensed genetic counselor or physician. Return JSON.';
    const prompt = `Variant: ${variant || 'unspecified'}
Gene: ${gene || 'unspecified'}
Condition: ${condition || 'unspecified'}
Raw test phrase: ${raw_test_phrase || 'unspecified'}
Ethnic background: ${ethnic_background || 'unspecified'}

Return JSON:
{
  "plain_language_explanation": "...",
  "what_this_does_NOT_mean": "...",
  "lifestyle_or_screening_actions": ["..."],
  "questions_to_ask_a_genetic_counselor": ["..."],
  "support_resources": ["NSGC.org", "..."],
  "disclaimer": "Educational only — not medical advice."
}`;
    const result = await queryAI(prompt, systemPrompt);
    const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
    const parsed = tryParseJson(raw) || { raw };
    await saveAiResult(req.user.id, 'health-risk-explain', JSON.stringify(req.body).slice(0, 1000), raw, result.model);
    res.json({ feature: 'Health Risk Explainer', parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Apply pass 4 — additional mechanical backlog endpoints.
function noKey(res) {
  return res.status(503).json({
    error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY to enable this endpoint.',
  });
}

function hasKey() {
  const k = process.env.OPENROUTER_API_KEY;
  return !!(k && k !== 'your_openrouter_api_key_here');
}

// POST /cousin-discovery — surface unknown relatives + suggest tree branches.
router.post('/cousin-discovery', authenticateToken, aiRateLimiter, async (req, res) => {
  if (!hasKey()) return noKey(res);
  try {
    const { user_haplogroups = [], known_locations = [], known_surnames = [], target_match_pool = [] } = req.body || {};
    const systemPrompt = 'You are a genetic genealogy expert who finds plausible cousin connections and proposes tree branches to investigate. Return STRICT JSON only.';
    const prompt = `User profile:
Haplogroups: ${JSON.stringify(user_haplogroups)}
Known ancestral locations: ${JSON.stringify(known_locations)}
Known surnames: ${JSON.stringify(known_surnames)}

Candidate match pool (each may include name, shared_cm, locations, surnames):
${JSON.stringify(target_match_pool).slice(0, 4000)}

Return JSON:
{
  "ranked_candidates": [
    { "name": "string", "likelihood_score": 0-100, "predicted_relationship": "string", "rationale": "string", "branches_to_explore": ["..."] }
  ],
  "tree_branches_to_build_out": ["..."],
  "research_actions": ["..."],
  "disclaimer": "Probabilistic — verify with documentary evidence."
}`;
    const result = await queryAI(prompt, systemPrompt);
    if (!result.success) return res.status(502).json({ error: result.result });
    const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
    const parsed = tryParseJson(raw) || { raw };
    await saveAiResult(req.user.id, 'cousin-discovery', JSON.stringify(req.body).slice(0, 1000), raw, result.model);
    res.json({ feature: 'Cousin Discovery', parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /dna-anomaly-detection — flag unexpected results (non-paternity, sample issues, etc.).
router.post('/dna-anomaly-detection', authenticateToken, aiRateLimiter, async (req, res) => {
  if (!hasKey()) return noKey(res);
  try {
    const { expected_ethnicity = [], reported_ethnicity = [], expected_relationships = [], observed_relationships = [], notes } = req.body || {};
    if (!Array.isArray(expected_ethnicity) && !Array.isArray(reported_ethnicity) && !Array.isArray(expected_relationships) && !Array.isArray(observed_relationships)) {
      return res.status(400).json({ error: 'Provide at least one of expected_ethnicity, reported_ethnicity, expected_relationships, observed_relationships' });
    }
    const systemPrompt = 'You are a sensitive, careful genetic counselor and genealogist. Identify potential anomalies (non-paternity events, misattributed parentage, sample contamination, lab errors, adoption clues) WITHOUT making accusations. Use cautious, empathetic language. Return JSON.';
    const prompt = `Expected ethnicity profile: ${JSON.stringify(expected_ethnicity)}
Reported ethnicity profile: ${JSON.stringify(reported_ethnicity)}
Expected relationships: ${JSON.stringify(expected_relationships)}
Observed relationships: ${JSON.stringify(observed_relationships)}
Additional notes: ${notes || 'none'}

Return JSON:
{
  "anomalies": [
    { "type": "string", "severity": "low|medium|high", "explanation": "string", "alternative_explanations": ["..."] }
  ],
  "recommended_followups": ["retest", "compare with second-line relative", "..."],
  "sensitive_disclosure_notes": "Plain-language guidance about how to approach the family with this information.",
  "disclaimer": "Anomaly hints are statistical, not conclusive. Many have benign explanations."
}`;
    const result = await queryAI(prompt, systemPrompt);
    if (!result.success) return res.status(502).json({ error: result.result });
    const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
    const parsed = tryParseJson(raw) || { raw };
    await saveAiResult(req.user.id, 'dna-anomaly-detection', JSON.stringify(req.body).slice(0, 1000), raw, result.model);
    res.json({ feature: 'DNA Anomaly Detection', parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /ethnicity-deep-dive — promote feature to a structured endpoint.
router.post('/ethnicity-deep-dive', authenticateToken, aiRateLimiter, async (req, res) => {
  if (!hasKey()) return noKey(res);
  try {
    const { ethnicity, percentage, parent_population, time_horizon_years } = req.body || {};
    if (!ethnicity) return res.status(400).json({ error: 'ethnicity is required' });

    const systemPrompt = 'You are a population geneticist providing a structured deep-dive on a single ethnicity component. Return STRICT JSON only.';
    const prompt = `Ethnicity component: ${ethnicity}
Percentage in user's profile: ${percentage ?? 'unspecified'}%
Parent population/region: ${parent_population || 'unspecified'}
Time horizon (years): ${time_horizon_years || 1000}

Return JSON:
{
  "summary": "1-2 paragraph overview",
  "geographic_origins": ["..."],
  "key_haplogroups": ["..."],
  "historical_movements": [{ "period": "string", "movement": "string" }],
  "cultural_signatures": ["..."],
  "common_misconceptions": ["..."],
  "next_research_steps": ["..."],
  "disclaimer": "Population labels are coarse; individuals carry mosaic ancestry."
}`;
    const result = await queryAI(prompt, systemPrompt);
    if (!result.success) return res.status(502).json({ error: result.result });
    const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
    const parsed = tryParseJson(raw) || { raw };
    await saveAiResult(req.user.id, 'ethnicity-deep-dive', JSON.stringify(req.body).slice(0, 1000), raw, result.model);
    res.json({ feature: 'Ethnicity Deep Dive', parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_dna_match_interpretation_endpoint = require('./routes/gap-no-dna-match-interpretation-endpoint');
const route_gap_no_migration_story_narrative_synthesis = require('./routes/gap-no-migration-story-narrative-synthesis');
const route_gap_no_health_risk_explanation_in_layman = require('./routes/gap-no-health-risk-explanation-in-layman');
const route_gap_no_cousin_discovery_branch_inference = require('./routes/gap-no-cousin-discovery-branch-inference');
const route_gap_no_ethnicity_deep_dive = require('./routes/gap-no-ethnicity-deep-dive');
const route_gap_no_dna_anomaly_detection_non_paternity = require('./routes/gap-no-dna-anomaly-detection-non-paternity');
const route_gap_no_expert_consultation_booking_genealogi = require('./routes/gap-no-expert-consultation-booking-genealogi');
const route_gap_no_webhook_integrations_with_ancestryfam = require('./routes/gap-no-webhook-integrations-with-ancestryfam');
const route_gap_no_real_time_tree_collaboration = require('./routes/gap-no-real-time-tree-collaboration');
const route_gap_limited_document_ocr_upload_exists_but = require('./routes/gap-limited-document-ocr-upload-exists-but');
const route_gap_no_payment_subscription_module = require('./routes/gap-no-payment-subscription-module');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ethnicity', require('./routes/ethnicity'));
app.use('/api/ancestors', require('./routes/ancestors'));
app.use('/api/health-risks', require('./routes/healthRisks'));
app.use('/api/migration', require('./routes/migration'));
app.use('/api/relationships', require('./routes/relationships'));
app.use('/api/haplogroups', require('./routes/haplogroups'));
app.use('/api/traits', require('./routes/traits'));
app.use('/api/timelines', require('./routes/timelines'));
app.use('/api/culture', require('./routes/culture'));
app.use('/api/surnames', require('./routes/surnames'));
app.use('/api/dna-matches', require('./routes/dnaMatches'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ancient', require('./routes/ancient'));
app.use('/api/ai-center', require('./routes/aiCenter'));
app.use('/api/export', require('./routes/export'));
app.use('/api/auth', require('./routes/passwordReset'));

// Apply pass 5 — additive mechanical routes
app.use('/api/family-tree', require('./routes/familyTree'));
app.use('/api/community', require('./routes/community'));
app.use('/api/dna-match-interpret', require('./routes/dnaMatchInterpretation'));
app.use('/api/health-ancestry', require('./routes/healthAncestryInsights'));


app.use('/api/gap-no-dna-match-interpretation-endpoint', route_gap_no_dna_match_interpretation_endpoint);
app.use('/api/gap-no-migration-story-narrative-synthesis', route_gap_no_migration_story_narrative_synthesis);
app.use('/api/gap-no-health-risk-explanation-in-layman', route_gap_no_health_risk_explanation_in_layman);
app.use('/api/gap-no-cousin-discovery-branch-inference', route_gap_no_cousin_discovery_branch_inference);
app.use('/api/gap-no-ethnicity-deep-dive', route_gap_no_ethnicity_deep_dive);
app.use('/api/gap-no-dna-anomaly-detection-non-paternity', route_gap_no_dna_anomaly_detection_non_paternity);
app.use('/api/gap-no-expert-consultation-booking-genealogi', route_gap_no_expert_consultation_booking_genealogi);
app.use('/api/gap-no-webhook-integrations-with-ancestryfam', route_gap_no_webhook_integrations_with_ancestryfam);
app.use('/api/gap-no-real-time-tree-collaboration', route_gap_no_real_time_tree_collaboration);
app.use('/api/gap-limited-document-ocr-upload-exists-but', route_gap_limited_document_ocr_upload_exists_but);
app.use('/api/gap-no-payment-subscription-module', route_gap_no_payment_subscription_module);

// === Custom Views (4 endpoints) — MUST be mounted BEFORE the 404 handler ===
app.use('/api/custom-views', require('./routes/customViews'));

// 404 fallback for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

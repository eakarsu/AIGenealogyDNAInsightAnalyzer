# Audit Apply Notes — AIGenealogyDNAInsightAnalyzer

Audit source: `_AUDIT/reports/batch_04.md` (#11). Verdict: partial-build (20 routes, **0 AI endpoints** per audit).

## Reality check

Audit understates AI: `routes/aiCenter.js` already has `/features`, `/query` (with 17 feature_id presets), `/general`, `/document-ocr`, `/history`. The audit's "0 AI endpoints" was likely a misread of the indirect routing pattern.

## Implementations applied

Added three structured AI endpoints to `routes/aiCenter.js`:

1. `POST /api/ai-center/dna-match-interpret` — given shared cM/segments/longest, returns ranked relationship predictions with probabilities.
2. `POST /api/ai-center/migration-story` — synthesizes haplogroups + locations + time periods into a migration narrative with timeline and uncertainties.
3. `POST /api/ai-center/health-risk-explain` — explains a genetic finding in plain language with screening actions and counselor questions; aggressive medical-disclaimer language.

All use existing `queryAI`, `aiRateLimiter`, `saveAiResult`. Syntax-checked.

## Backlog (prioritized)

### Mechanical
- `/cousin-discovery` — match unknown relatives + suggest tree branches (needs DNA matching index).
- `/dna-anomaly-detection` — flag unexpected results (non-paternity, sample issues).
- `/ethnicity-deep-dive` already exists as feature_id; could be promoted to a dedicated structured endpoint.

### Needs creds / external
- Ancestry / FamilySearch API integrations.
- DNA testing partner integrations (23andMe, AncestryDNA, MyHeritage).
- Document OCR for historical records (already partial).

### Needs product decision
- Privacy tiers for sharing results with cousins.
- Sensitivity protocols for non-paternity / adoption disclosures.

### Custom features
- Agentic genealogy researcher.
- Family tree visualization (frontend).
- Community / collaboration platform.

## Apply pass 3 (frontend)

**Action:** LEFT-AS-IS — frontend already fully wired.

- `frontend/src/pages/AIStructuredTools.jsx` (251 lines) wires all three pass-2 endpoints (`dna-match-interpret`, `migration-story`, `health-risk-explain`) via tabbed UI.
- `frontend/src/App.jsx` registers `/ai-structured-tools`.
- Auth via shared `api.js` (Bearer JWT from localStorage).

No FE edits this pass. Log: `_AUDIT/apply3_logs/ab3_54.md`.

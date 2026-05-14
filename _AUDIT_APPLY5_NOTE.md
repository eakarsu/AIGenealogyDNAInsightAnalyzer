# Apply Pass 5 — AIGenealogyDNAInsightAnalyzer
Date: 2026-05-08
Stack: Node-Express + React (Vite), Postgres `pg`.

## Verified present (pilot lesson confirmed)
The pass-2 note's "Backlog/Mechanical" listed `/cousin-discovery`, `/dna-anomaly-detection`, `/ethnicity-deep-dive` as still-missing — but they ARE already present in `backend/routes/aiCenter.js` (see lines 357, 389, 422). Pass 4 was apparently completed silently without updating the note. Confirmed via grep.

All AI endpoints present:
- `/features`, `/query`, `/general`, `/document-ocr`, `/history`
- Pass-2 structured: `/dna-match-interpret`, `/migration-story`, `/health-risk-explain`
- Pass-? mechanical: `/cousin-discovery`, `/dna-anomaly-detection`, `/ethnicity-deep-dive`
- 18 non-AI route files (CRUD via `crudFactory`).

## Implemented this pass (2 mechanical features, 9 endpoints; additive only)
Focus shifted to non-AI gaps (audit "no family tree visualization", "no community forums"):

1. **Family-tree closure / projection** — closes "no family tree visualization" (data side; FE viz still product decision).
   - `backend/routes/familyTree.js` (~140 lines): people + parent_of/spouse_of edges, ancestors / descendants BFS with depth limit, lowest-common-ancestor relationship lookup with cousin-degree formula (e.g., "2nd cousin 1× removed").
   - Endpoints: `GET/POST /api/family-tree/people`, `POST /api/family-tree/edges`, `GET /api/family-tree/edges`, `GET /api/family-tree/ancestors/:id`, `GET /api/family-tree/descendants/:id`, `GET /api/family-tree/relationship?a=&b=`.
2. **Community / collaboration threads** — closes "no community forums".
   - `backend/routes/community.js` (~80 lines): threads tagged by surname/location/haplogroup + replies. Search via ILIKE.
   - Endpoints: `GET/POST /api/community/threads`, `GET /api/community/threads/:id`, `POST /api/community/threads/:id/replies`.
3. **Frontend** — `frontend/src/pages/FamilyTreeAndCommunity.jsx` registered at `/family-tree-community`. Uses existing `apiGet`/`apiPost` and JWT bearer.
4. Routes wired in `backend/server.js` after the existing `passwordReset` registration.

## Deferred
- **Ancestry / FamilySearch / 23andMe / AncestryDNA / MyHeritage API integrations** — NEEDS-CREDS.
- **Document OCR for historical records (production)** — partial via existing `/document-ocr`; production needs vision API quota.
- **Privacy tiers for sharing results with cousins** — NEEDS-PRODUCT-DECISION (consent model, redaction policy).
- **Sensitivity protocols for non-paternity / adoption disclosures** — NEEDS-PRODUCT-DECISION (clinical / counselor guidance).
- **Agentic genealogy researcher** — NEEDS-PRODUCT-DECISION (multi-step orchestration over external archives).
- **Family-tree FE visualization (graph rendering)** — OUT-OF-SCOPE for this pass (backend closure now in place).

## Smoke test
- `node -c` on `familyTree.js`, `community.js`, `server.js` — PASS.
- Did not boot (Postgres). DDL idempotent.
- Relationship-formula spot-check: A→GP and B→GP (both depth 2) ⇒ "1st cousin"; A→GP and B→GP-of-GP (depth 2 vs 4) ⇒ "1st cousin 2× removed". Matches genealogy convention.

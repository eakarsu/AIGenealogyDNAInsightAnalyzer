import React, { useState } from 'react';
import { apiPost } from '../api';

/**
 * Frontend for the 3 new structured AI endpoints in routes/aiCenter.js:
 *   POST /api/ai-center/dna-match-interpret
 *   POST /api/ai-center/migration-story
 *   POST /api/ai-center/health-risk-explain
 *
 * Mirrors AICenter.jsx style — uses apiPost helper, ai-center-header /
 * ai-feature-card classNames, and the same toast pattern.
 */

const TABS = [
  { id: 'dna-match-interpret', label: 'DNA Match Interpret', icon: '🧬' },
  { id: 'migration-story', label: 'Migration Story', icon: '🗺️' },
  { id: 'health-risk-explain', label: 'Health Risk Explain', icon: '⚠️' },
  { id: 'cousin-discovery', label: 'Cousin Discovery', icon: '👥' },
  { id: 'dna-anomaly-detection', label: 'DNA Anomaly Detection', icon: '🔍' },
  { id: 'ethnicity-deep-dive', label: 'Ethnicity Deep Dive', icon: '🌍' },
];

function ResultBlock({ data, error }) {
  if (error) {
    return (
      <div style={{ marginTop: 16, padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }
  if (!data) return null;
  const text = data.result || data.narrative || data.explanation || data.summary;
  return (
    <div style={{ marginTop: 16, padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
      <h3 style={{ marginTop: 0 }}>AI Result</h3>
      {text && typeof text === 'string' ? (
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{text}</p>
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default function AIStructuredTools() {
  const [tab, setTab] = useState('dna-match-interpret');

  const [dnaForm, setDnaForm] = useState({
    shared_cm: 850,
    shared_segments: 30,
    longest_segment_cm: 60,
    person_age: 45,
    match_age: 50,
    notes: '',
  });

  const [migrationForm, setMigrationForm] = useState({
    haplogroups: 'R1b1a1a (Y), H1a (mt)',
    locations: 'Connacht, Ireland (1820); New York City (1851); Boston (1880); Chicago (1905)',
    time_period: '1800-1920',
    surnames: 'Murphy, O\'Sullivan',
  });

  const [healthForm, setHealthForm] = useState({
    finding: 'BRCA2 c.5946delT (pathogenic) heterozygous variant',
    family_history: 'Mother and maternal aunt diagnosed with breast cancer in their 50s.',
    age: 38,
    sex: 'female',
  });

  const [cousinForm, setCousinForm] = useState({
    user_haplogroups: 'R1b1a1a (Y), H1a (mt)',
    known_locations: 'Connacht, Ireland; New York; Boston',
    known_surnames: 'Murphy, O\'Sullivan',
    target_match_pool: '[{"name":"J. Murphy","shared_cm":120,"locations":["Boston"],"surnames":["Murphy"]}]',
  });

  const [anomalyForm, setAnomalyForm] = useState({
    expected_ethnicity: 'Irish 50%, Italian 50%',
    reported_ethnicity: 'Irish 35%, Italian 25%, German 30%, Eastern European 10%',
    expected_relationships: 'Father, paternal uncle',
    observed_relationships: 'Father shows as half-uncle',
    notes: '',
  });

  const [ethnicityForm, setEthnicityForm] = useState({
    ethnicity: 'Sardinian',
    percentage: 12,
    parent_population: 'Southern European',
    time_horizon_years: 2000,
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const submit = async () => {
    setLoading(true);
    setErrors((prev) => ({ ...prev, [tab]: null }));
    setResults((prev) => ({ ...prev, [tab]: null }));
    try {
      let path, body;
      if (tab === 'dna-match-interpret') {
        path = '/ai-center/dna-match-interpret';
        body = {
          shared_cm: Number(dnaForm.shared_cm) || 0,
          shared_segments: Number(dnaForm.shared_segments) || 0,
          longest_segment_cm: Number(dnaForm.longest_segment_cm) || 0,
          person_age: Number(dnaForm.person_age) || undefined,
          match_age: Number(dnaForm.match_age) || undefined,
          notes: dnaForm.notes,
        };
      } else if (tab === 'migration-story') {
        path = '/ai-center/migration-story';
        body = { ...migrationForm };
      } else if (tab === 'health-risk-explain') {
        path = '/ai-center/health-risk-explain';
        body = { ...healthForm, age: Number(healthForm.age) || undefined };
      } else if (tab === 'cousin-discovery') {
        path = '/ai-center/cousin-discovery';
        let pool = [];
        try { pool = JSON.parse(cousinForm.target_match_pool || '[]'); } catch (_) { pool = []; }
        body = {
          user_haplogroups: cousinForm.user_haplogroups.split(',').map(s => s.trim()).filter(Boolean),
          known_locations: cousinForm.known_locations.split(';').map(s => s.trim()).filter(Boolean),
          known_surnames: cousinForm.known_surnames.split(',').map(s => s.trim()).filter(Boolean),
          target_match_pool: pool,
        };
      } else if (tab === 'dna-anomaly-detection') {
        path = '/ai-center/dna-anomaly-detection';
        body = {
          expected_ethnicity: anomalyForm.expected_ethnicity.split(',').map(s => s.trim()).filter(Boolean),
          reported_ethnicity: anomalyForm.reported_ethnicity.split(',').map(s => s.trim()).filter(Boolean),
          expected_relationships: anomalyForm.expected_relationships.split(',').map(s => s.trim()).filter(Boolean),
          observed_relationships: anomalyForm.observed_relationships.split(',').map(s => s.trim()).filter(Boolean),
          notes: anomalyForm.notes,
        };
      } else if (tab === 'ethnicity-deep-dive') {
        path = '/ai-center/ethnicity-deep-dive';
        body = {
          ethnicity: ethnicityForm.ethnicity,
          percentage: Number(ethnicityForm.percentage) || undefined,
          parent_population: ethnicityForm.parent_population,
          time_horizon_years: Number(ethnicityForm.time_horizon_years) || undefined,
        };
      }
      const res = await apiPost(path, body);
      setResults((prev) => ({ ...prev, [tab]: res }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [tab]: err.message || 'Request failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="ai-center-header">
        <h1>Structured AI Tools</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          DNA match interpretation, migration narrative, and health-risk explanation — structured outputs from the new endpoints.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '20px 0' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              border: tab === t.id ? '1px solid #6366f1' : '1px solid #e2e8f0',
              background: tab === t.id ? '#eef2ff' : 'white',
              color: tab === t.id ? '#4f46e5' : '#374151',
              fontWeight: tab === t.id ? 600 : 400,
            }}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="ai-feature-card" style={{ padding: 20, cursor: 'default' }}>
        {tab === 'dna-match-interpret' && (
          <>
            <h3>DNA Match Interpretation</h3>
            <p style={{ color: '#64748b' }}>
              Given shared cM, segments, and the longest segment, returns ranked relationship predictions with probabilities.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label>Shared cM</label>
                <input type="number" value={dnaForm.shared_cm} onChange={(e) => setDnaForm({ ...dnaForm, shared_cm: e.target.value })} />
              </div>
              <div>
                <label>Shared segments</label>
                <input type="number" value={dnaForm.shared_segments} onChange={(e) => setDnaForm({ ...dnaForm, shared_segments: e.target.value })} />
              </div>
              <div>
                <label>Longest segment (cM)</label>
                <input type="number" value={dnaForm.longest_segment_cm} onChange={(e) => setDnaForm({ ...dnaForm, longest_segment_cm: e.target.value })} />
              </div>
              <div>
                <label>Your age</label>
                <input type="number" value={dnaForm.person_age} onChange={(e) => setDnaForm({ ...dnaForm, person_age: e.target.value })} />
              </div>
              <div>
                <label>Match's age</label>
                <input type="number" value={dnaForm.match_age} onChange={(e) => setDnaForm({ ...dnaForm, match_age: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Notes</label>
              <textarea rows={2} value={dnaForm.notes} onChange={(e) => setDnaForm({ ...dnaForm, notes: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'migration-story' && (
          <>
            <h3>Migration Story</h3>
            <p style={{ color: '#64748b' }}>
              Synthesizes haplogroups + locations + time periods into a migration narrative with timeline and uncertainties.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label>Haplogroups</label>
              <input value={migrationForm.haplogroups} onChange={(e) => setMigrationForm({ ...migrationForm, haplogroups: e.target.value })} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Locations (in order)</label>
              <textarea rows={3} value={migrationForm.locations} onChange={(e) => setMigrationForm({ ...migrationForm, locations: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Time period</label>
                <input value={migrationForm.time_period} onChange={(e) => setMigrationForm({ ...migrationForm, time_period: e.target.value })} />
              </div>
              <div>
                <label>Surnames</label>
                <input value={migrationForm.surnames} onChange={(e) => setMigrationForm({ ...migrationForm, surnames: e.target.value })} />
              </div>
            </div>
          </>
        )}

        {tab === 'health-risk-explain' && (
          <>
            <h3>Health Risk Explanation</h3>
            <p style={{ color: '#64748b' }}>
              Explains a genetic finding in plain language with screening actions and counselor questions.
              <br /><strong>Not a substitute for medical advice.</strong>
            </p>
            <div style={{ marginBottom: 12 }}>
              <label>Finding</label>
              <textarea rows={2} value={healthForm.finding} onChange={(e) => setHealthForm({ ...healthForm, finding: e.target.value })} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Family history</label>
              <textarea rows={2} value={healthForm.family_history} onChange={(e) => setHealthForm({ ...healthForm, family_history: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Age</label>
                <input type="number" value={healthForm.age} onChange={(e) => setHealthForm({ ...healthForm, age: e.target.value })} />
              </div>
              <div>
                <label>Sex</label>
                <select value={healthForm.sex} onChange={(e) => setHealthForm({ ...healthForm, sex: e.target.value })}>
                  <option value="unspecified">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>
          </>
        )}

        {tab === 'cousin-discovery' && (
          <>
            <h3>Cousin Discovery</h3>
            <p style={{ color: '#64748b' }}>
              Surface unknown relatives from a candidate match pool and propose tree branches to investigate.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Your haplogroups (comma-separated)</label>
                <input value={cousinForm.user_haplogroups} onChange={(e) => setCousinForm({ ...cousinForm, user_haplogroups: e.target.value })} />
              </div>
              <div>
                <label>Known locations (semicolon-separated)</label>
                <input value={cousinForm.known_locations} onChange={(e) => setCousinForm({ ...cousinForm, known_locations: e.target.value })} />
              </div>
              <div>
                <label>Known surnames (comma-separated)</label>
                <input value={cousinForm.known_surnames} onChange={(e) => setCousinForm({ ...cousinForm, known_surnames: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Candidate match pool (JSON array)</label>
              <textarea rows={4} value={cousinForm.target_match_pool} onChange={(e) => setCousinForm({ ...cousinForm, target_match_pool: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'dna-anomaly-detection' && (
          <>
            <h3>DNA Anomaly Detection</h3>
            <p style={{ color: '#64748b' }}>
              Flag unexpected results — non-paternity events, sample issues, mismatched relationships — with empathetic guidance.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Expected ethnicity (comma-separated)</label>
                <input value={anomalyForm.expected_ethnicity} onChange={(e) => setAnomalyForm({ ...anomalyForm, expected_ethnicity: e.target.value })} />
              </div>
              <div>
                <label>Reported ethnicity (comma-separated)</label>
                <input value={anomalyForm.reported_ethnicity} onChange={(e) => setAnomalyForm({ ...anomalyForm, reported_ethnicity: e.target.value })} />
              </div>
              <div>
                <label>Expected relationships (comma-separated)</label>
                <input value={anomalyForm.expected_relationships} onChange={(e) => setAnomalyForm({ ...anomalyForm, expected_relationships: e.target.value })} />
              </div>
              <div>
                <label>Observed relationships (comma-separated)</label>
                <input value={anomalyForm.observed_relationships} onChange={(e) => setAnomalyForm({ ...anomalyForm, observed_relationships: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Notes (optional)</label>
              <textarea rows={2} value={anomalyForm.notes} onChange={(e) => setAnomalyForm({ ...anomalyForm, notes: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'ethnicity-deep-dive' && (
          <>
            <h3>Ethnicity Deep Dive</h3>
            <p style={{ color: '#64748b' }}>
              Detailed structured analysis of one ethnicity component — origins, haplogroups, movements, cultural markers.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Ethnicity</label>
                <input value={ethnicityForm.ethnicity} onChange={(e) => setEthnicityForm({ ...ethnicityForm, ethnicity: e.target.value })} />
              </div>
              <div>
                <label>Percentage (%)</label>
                <input type="number" value={ethnicityForm.percentage} onChange={(e) => setEthnicityForm({ ...ethnicityForm, percentage: e.target.value })} />
              </div>
              <div>
                <label>Parent population</label>
                <input value={ethnicityForm.parent_population} onChange={(e) => setEthnicityForm({ ...ethnicityForm, parent_population: e.target.value })} />
              </div>
              <div>
                <label>Time horizon (years)</label>
                <input type="number" value={ethnicityForm.time_horizon_years} onChange={(e) => setEthnicityForm({ ...ethnicityForm, time_horizon_years: e.target.value })} />
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 16 }}>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              background: '#6366f1',
              color: 'white',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Running...' : 'Run AI'}
          </button>
        </div>

        <ResultBlock data={results[tab]} error={errors[tab]} />
      </div>
    </div>
  );
}

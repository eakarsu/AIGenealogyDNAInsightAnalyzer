import React, { useState } from 'react';
import { apiPost } from '../../api';

// NON-VIZ 1 — Ancestry insight PDF generator panel.
export default function AncestryPdfPanel() {
  const [title, setTitle] = useState('My Ancestry Insight Report');
  const [includeHealth, setIncludeHealth] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiPost('/custom-views/ancestry-pdf', { title, include_health: includeHealth });
      setResult(d);
    } catch (e) {
      setErr(e.message || 'Failed');
    }
    setLoading(false);
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.body || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename || 'ancestry-insight.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div data-testid="ancestry-pdf-panel" style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Ancestry Insight PDF</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Report title"
          style={{ flex: 1, minWidth: 220, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={includeHealth} onChange={(e) => setIncludeHealth(e.target.checked)} />
          Include health risks
        </label>
        <button
          onClick={generate}
          disabled={loading}
          style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}
        >
          {loading ? 'Generating.' : 'Generate PDF'}
        </button>
        {result && (
          <button
            onClick={download}
            style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}
          >
            Download
          </button>
        )}
      </div>
      {err && <div style={{ marginTop: 10, color: '#ef4444' }}>Error: {err}</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            {result.filename} | pages: {result.page_count} | ethnicity rows: {result.ethnicity_rows} | matches: {result.match_rows}
          </div>
          <pre style={{
            background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 8,
            fontSize: 12, maxHeight: 280, overflow: 'auto', whiteSpace: 'pre-wrap',
          }}>
            {result.body}
          </pre>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { apiGet } from '../../api';

// VIZ 2 — DNA matches relationship heatmap (matches x estimated relationship).
export default function RelationshipHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet('/custom-views/relationship-heatmap')
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setErr(e.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#64748b' }}>Loading heatmap.</div>;
  if (err) return <div style={{ padding: 16, color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return null;

  const max = Math.max(1, data.max_cell_count || 0);
  function bg(count) {
    if (!count) return '#f1f5f9';
    const t = count / max; // 0..1
    // interpolate from light indigo to deep indigo
    const r = Math.round(238 - (238 - 67) * t);
    const g = Math.round(242 - (242 - 56) * t);
    const b = Math.round(255 - (255 - 202) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
  function fg(count) {
    return count > max * 0.55 ? '#fff' : '#0f172a';
  }

  return (
    <div data-testid="relationship-heatmap" style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>{data.title || 'DNA Match Heatmap'}</h3>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
        {data.match_count} matches | peak cell: {max}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: 6, textAlign: 'left', color: '#64748b' }}>cM Bucket \ Relationship</th>
              {data.x_axis.map((c) => (
                <th key={c} style={{ padding: '6px 10px', textAlign: 'center', color: '#475569' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, ri) => (
              <tr key={ri}>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: '#475569', fontWeight: 500 }}>
                  {data.y_axis[ri]}
                </th>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    title={`${data.y_axis[ri]} × ${data.x_axis[ci]}: ${cell.count}`}
                    style={{
                      width: 64, height: 36, textAlign: 'center', borderRadius: 6,
                      background: bg(cell.count), color: fg(cell.count), fontWeight: 600,
                    }}
                  >
                    {cell.count || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

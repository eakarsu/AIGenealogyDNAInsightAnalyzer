import React, { useEffect, useState } from 'react';
import { apiGet } from '../../api';

// VIZ 1 — Ethnicity breakdown donut chart (pure SVG, no chart lib).
export default function EthnicityDonut() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet('/custom-views/ethnicity-breakdown')
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setErr(e.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#64748b' }}>Loading ethnicity breakdown.</div>;
  if (err) return <div style={{ padding: 16, color: '#ef4444' }}>Error: {err}</div>;
  if (!data || !data.segments || data.segments.length === 0) {
    return <div style={{ padding: 16, color: '#64748b' }}>No ethnicity data yet.</div>;
  }

  const size = 240;
  const radius = 90;
  const innerR = 55;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.segments.reduce((s, x) => s + Number(x.percentage || 0), 0) || 1;

  let angle = -Math.PI / 2;
  const arcs = data.segments.map((seg, i) => {
    const value = Number(seg.percentage || 0);
    const sweep = (value / total) * Math.PI * 2;
    const x1 = cx + radius * Math.cos(angle);
    const y1 = cy + radius * Math.sin(angle);
    const x2 = cx + radius * Math.cos(angle + sweep);
    const y2 = cy + radius * Math.sin(angle + sweep);
    const ix1 = cx + innerR * Math.cos(angle + sweep);
    const iy1 = cy + innerR * Math.sin(angle + sweep);
    const ix2 = cx + innerR * Math.cos(angle);
    const iy2 = cy + innerR * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const d = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');
    angle += sweep;
    return { d, color: seg.color, key: i, label: seg.region, value };
  });

  return (
    <div data-testid="ethnicity-donut" style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>{data.title || 'Ethnicity Breakdown'}</h3>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width={size} height={size} role="img" aria-label="Ethnicity donut chart">
          {arcs.map((a) => (
            <path key={a.key} d={a.d} fill={a.color} stroke="#fff" strokeWidth="1" />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
            {data.region_count} regions
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#64748b">
            {data.total_percentage}% total
          </text>
        </svg>
        <div style={{ flex: 1, minWidth: 200 }}>
          {data.segments.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ width: 12, height: 12, background: s.color, borderRadius: 3, marginRight: 8, display: 'inline-block' }} />
              <span style={{ flex: 1, fontSize: 13 }}>{s.region}</span>
              <strong style={{ fontSize: 13 }}>{s.percentage}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

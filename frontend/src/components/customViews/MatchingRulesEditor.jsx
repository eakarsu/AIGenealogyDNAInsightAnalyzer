import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api';

// NON-VIZ 2 — DNA matching rules editor (CRUD cM thresholds + relationship rules).
const EMPTY = { relationship: '', min_cm: 0, max_cm: 0, priority: 99, notes: '' };

export default function MatchingRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const d = await apiGet('/custom-views/matching-rules');
      setRules(Array.isArray(d?.data) ? d.data : []);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    }
  }
  useEffect(() => { load(); }, []);

  function startEdit(r) {
    setForm({
      relationship: r.relationship,
      min_cm: r.min_cm,
      max_cm: r.max_cm,
      priority: r.priority,
      notes: r.notes || '',
    });
    setEditingId(r.id);
    setErr(null);
  }

  function cancelEdit() {
    setForm(EMPTY);
    setEditingId(null);
  }

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        relationship: form.relationship,
        min_cm: Number(form.min_cm),
        max_cm: Number(form.max_cm),
        priority: Number(form.priority),
        notes: form.notes,
      };
      const res = editingId
        ? await apiPut(`/custom-views/matching-rules/${editingId}`, payload)
        : await apiPost('/custom-views/matching-rules', payload);
      if (res && res.error) {
        setErr(res.error);
      } else {
        cancelEdit();
        await load();
      }
    } catch (e) {
      setErr(e.message || 'Failed');
    }
    setBusy(false);
  }

  async function remove(id) {
    setBusy(true);
    try {
      await apiDelete(`/custom-views/matching-rules/${id}`);
      await load();
    } catch (e) {
      setErr(e.message || 'Failed');
    }
    setBusy(false);
  }

  return (
    <div data-testid="matching-rules-editor" style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>DNA Matching Rules Editor</h3>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#64748b' }}>
        Configure cM thresholds + predicted relationship rules.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={th}>Priority</th>
              <th style={th}>Relationship</th>
              <th style={th}>Min cM</th>
              <th style={th}>Max cM</th>
              <th style={th}>Notes</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, color: '#94a3b8' }}>No rules yet.</td></tr>
            )}
            {rules.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={td}>{r.priority}</td>
                <td style={td}>{r.relationship}</td>
                <td style={td}>{r.min_cm}</td>
                <td style={td}>{r.max_cm}</td>
                <td style={td}>{r.notes}</td>
                <td style={td}>
                  <button onClick={() => startEdit(r)} style={btnLink}>Edit</button>
                  {' | '}
                  <button onClick={() => remove(r.id)} style={btnDanger}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          {editingId ? `Edit rule #${editingId}` : 'Add new rule'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <input style={inp} placeholder="Relationship" value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          <input style={inp} type="number" placeholder="Min cM" value={form.min_cm}
            onChange={(e) => setForm({ ...form, min_cm: e.target.value })} />
          <input style={inp} type="number" placeholder="Max cM" value={form.max_cm}
            onChange={(e) => setForm({ ...form, max_cm: e.target.value })} />
          <input style={inp} type="number" placeholder="Priority" value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          <input style={inp} placeholder="Notes" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <button onClick={submit} disabled={busy} style={btnPrimary}>
            {editingId ? 'Save changes' : 'Add rule'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} style={btnSecondary}>Cancel</button>
          )}
        </div>
        {err && <div style={{ color: '#ef4444', marginTop: 8 }}>{err}</div>}
      </div>
    </div>
  );
}

const th = { padding: 8, textAlign: 'left', fontWeight: 600, color: '#475569' };
const td = { padding: 8, color: '#0f172a' };
const inp = { padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 };
const btnPrimary = { padding: '8px 14px', background: '#6366f1', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' };
const btnSecondary = { padding: '8px 14px', background: '#e2e8f0', color: '#0f172a', border: 0, borderRadius: 6, cursor: 'pointer' };
const btnLink = { background: 'none', border: 0, color: '#6366f1', cursor: 'pointer', padding: 0 };
const btnDanger = { background: 'none', border: 0, color: '#ef4444', cursor: 'pointer', padding: 0 };

import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../api';

export default function AIHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [expanded, setExpanded] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const result = await apiGet(`/ai-center/history?page=${p}&limit=20`);
      if (result && result.data) {
        setHistory(result.data);
        setPagination(result.pagination || { total: 0, totalPages: 1, limit: 20 });
      } else {
        setHistory([]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load AI history');
      setHistory([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadHistory(newPage);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxWidth: 420, fontSize: 14,
        }}>
          {toast.msg}
        </div>
      )}

      <div className="feature-page-header">
        <div className="header-left">
          <span className="header-icon">📋</span>
          <div>
            <h1>AI Query History</h1>
            <p>All past AI analyses and results</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ai-loading"><div className="spinner" /><span>Loading history...</span></div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          No AI queries yet. Use the AI Research Center to get started.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
                  padding: 16, cursor: 'pointer',
                }}
                onClick={() => toggleExpand(item.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{
                      background: '#6366f1', color: '#fff', borderRadius: 4, padding: '2px 8px',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {item.tool_name || 'AI'}
                    </span>
                    {item.model && (
                      <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                        {item.model}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 18 }}>
                      {expanded[item.id] ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {item.input_summary && (
                  <div style={{ marginTop: 8, fontSize: 13, color: '#94a3b8' }}>
                    <strong style={{ color: '#cbd5e1' }}>Input:</strong>{' '}
                    {item.input_summary.length > 120 && !expanded[item.id]
                      ? item.input_summary.slice(0, 120) + '...'
                      : item.input_summary}
                  </div>
                )}

                {expanded[item.id] && item.result && (
                  <div style={{
                    marginTop: 12, padding: 14, background: '#0f172a', borderRadius: 8,
                    fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    maxHeight: 400, overflowY: 'auto',
                  }}>
                    {item.result}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 0' }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #334155', background: page <= 1 ? '#1e293b' : '#334155', color: '#e2e8f0', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: '#64748b' }}>…</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      style={{
                        padding: '6px 12px', borderRadius: 6, border: '1px solid',
                        borderColor: p === page ? '#6366f1' : '#334155',
                        background: p === page ? '#6366f1' : '#1e293b',
                        color: '#e2e8f0', cursor: 'pointer', fontWeight: p === page ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #334155', background: page >= pagination.totalPages ? '#1e293b' : '#334155', color: '#e2e8f0', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
              <span style={{ color: '#64748b', fontSize: 13 }}>
                Page {page} of {pagination.totalPages} ({pagination.total} total)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

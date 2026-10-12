import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { features } from '../features';
import { apiGet, apiPost, apiPut, apiDelete, listRows } from '../api';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIReport from '../components/AIReport';

export function RecordTable({ feature, data, page, pagination, onSelect }) {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            {feature.displayColumns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={feature.columns.length + 1} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No records yet. Click "New Item" to add one.</td></tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.id} onClick={() => onSelect(item)}>
                <td>{(page - 1) * pagination.limit + idx + 1}</td>
                {feature.columns.map((col) => (
                  <td key={col}>{item[col] != null ? String(item[col]) : '-'}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function FeaturePage() {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const feature = features.find((f) => f.id === featureId);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const ocrFileRef = useRef();

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async (p = 1) => {
    if (!feature) return;
    setLoading(true);
    try {
      const result = await apiGet(`${feature.apiPath}?page=${p}&limit=20`);
      const rows = listRows(result);
      setData(rows);
      setPagination(result?.pagination && typeof result.pagination === 'object'
        ? { ...result.pagination, limit: Number(result.pagination.limit) || 20 }
        : { total: rows.length, totalPages: 1, limit: 20 });
      if (!Array.isArray(result) && !Array.isArray(result?.data)) {
        showToast(result?.error || 'The records response was not a list.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to load data');
      setData([]);
    }
    setLoading(false);
  }, [feature]);

  useEffect(() => {
    setPage(1);
    loadData(1);
    setSelectedItem(null);
    setShowForm(false);
    setEditItem(null);
  }, [featureId, loadData]);

  if (!feature) {
    return (
      <div>
        <h1>Feature not found</h1>
        <button className="btn-action btn-edit" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await apiDelete(`${feature.apiPath}/${id}`);
    setSelectedItem(null);
    loadData(page);
  };

  const handleSave = async (formData) => {
    if (editItem) {
      await apiPut(`${feature.apiPath}/${editItem.id}`, formData);
    } else {
      await apiPost(feature.apiPath, formData);
    }
    setShowForm(false);
    setEditItem(null);
    loadData(page);
  };

  const handleEdit = (item) => {
    setSelectedItem(null);
    setEditItem(item);
    setShowForm(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadData(newPage);
  };

  const handleOCR = async () => {
    if (!ocrFile) return;
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(ocrFile);
      });
      const result = await apiPost('/ai-center/document-ocr', {
        image_base64: base64,
        mime_type: ocrFile.type,
        document_type: 'genealogy',
      });
      setOcrResult(result);
      showToast('Document analyzed successfully!', 'success');
      loadData(page);
    } catch (err) {
      showToast(err.message || 'OCR failed');
    }
    setOcrLoading(false);
  };

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxWidth: 420, fontSize: 14,
        }}>
          {toast.msg}
        </div>
      )}

      <div className="feature-page-header">
        <div className="header-left">
          <span className="header-icon">{feature.icon}</span>
          <div>
            <h1>{feature.name}</h1>
            <p>{feature.description}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {feature.id === 'ancestors' && (
            <button
              className="btn-new-item"
              style={{ background: '#10b981' }}
              onClick={async () => {
                try {
                  window.location.href = '/api/export/gedcom';
                } catch {
                  showToast('Export failed');
                }
              }}
            >
              Export GEDCOM
            </button>
          )}
          <button className="btn-new-item" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New Item
          </button>
        </div>
      </div>

      {featureId === 'documents' && (
        <div style={{
          background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
          padding: 20, marginBottom: 20,
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: 12, fontSize: 15 }}>OCR Document</h3>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
            Upload an image of a genealogy document to extract text and structured fields using AI vision.
          </p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Choose a real image from your device before extraction. A sample cannot supply an uploaded file.</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={ocrFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setOcrFile(e.target.files[0] || null)}
            />
            <button
              onClick={() => ocrFileRef.current.click()}
              style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid #334155',
                background: '#334155', color: '#e2e8f0', cursor: 'pointer', fontSize: 13,
              }}
            >
              {ocrFile ? ocrFile.name : 'Choose Image'}
            </button>
            <button
              onClick={handleOCR}
              disabled={!ocrFile || ocrLoading}
              style={{
                padding: '8px 16px', borderRadius: 6, border: 'none',
                background: ocrFile && !ocrLoading ? '#6366f1' : '#334155',
                color: '#e2e8f0', cursor: ocrFile && !ocrLoading ? 'pointer' : 'not-allowed', fontSize: 13,
              }}
            >
              {ocrLoading ? 'Analyzing...' : 'Extract Text with AI'}
            </button>
          </div>

          {ocrResult && ocrResult.extracted_data && <AIReport response={ocrResult.extracted_data} title="Extracted document fields" model={ocrResult.model} />}
        </div>
      )}

      {loading ? (
        <div className="ai-loading"><div className="spinner" /><span>Loading data...</span></div>
      ) : (
        <>
          <RecordTable feature={feature} data={data} page={page} pagination={pagination} onSelect={setSelectedItem} />

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
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

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          feature={feature}
          onClose={() => setSelectedItem(null)}
          onEdit={() => handleEdit(selectedItem)}
          onDelete={() => handleDelete(selectedItem.id)}
        />
      )}

      {showForm && (
        <FormModal
          feature={feature}
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

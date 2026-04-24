import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { features } from '../features';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

export default function FeaturePage() {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const feature = features.find((f) => f.id === featureId);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = useCallback(async () => {
    if (!feature) return;
    setLoading(true);
    try {
      const result = await apiGet(feature.apiPath);
      setData(Array.isArray(result) ? result : []);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [feature]);

  useEffect(() => {
    loadData();
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
    loadData();
  };

  const handleSave = async (formData) => {
    if (editItem) {
      await apiPut(`${feature.apiPath}/${editItem.id}`, formData);
    } else {
      await apiPost(feature.apiPath, formData);
    }
    setShowForm(false);
    setEditItem(null);
    loadData();
  };

  const handleEdit = (item) => {
    setSelectedItem(null);
    setEditItem(item);
    setShowForm(true);
  };

  return (
    <div>
      <div className="feature-page-header">
        <div className="header-left">
          <span className="header-icon">{feature.icon}</span>
          <div>
            <h1>{feature.name}</h1>
            <p>{feature.description}</p>
          </div>
        </div>
        <button className="btn-new-item" onClick={() => { setEditItem(null); setShowForm(true); }}>
          + New Item
        </button>
      </div>

      {loading ? (
        <div className="ai-loading"><div className="spinner" /><span>Loading data...</span></div>
      ) : (
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
                  <tr key={item.id} onClick={() => setSelectedItem(item)}>
                    <td>{idx + 1}</td>
                    {feature.columns.map((col) => (
                      <td key={col}>{item[col] != null ? String(item[col]) : '-'}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

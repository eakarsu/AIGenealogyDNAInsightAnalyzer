import React, { useState } from 'react';
import { apiPost } from '../api';
import ReactMarkdown from 'react-markdown';

export default function DetailModal({ item, feature, onClose, onEdit, onDelete }) {
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAnalyze = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const data = await apiPost(`${feature.apiPath}/${item.id}/analyze`, {});
      setAiResult(data.ai_analysis);
    } catch (err) {
      setAiResult({ success: false, result: 'Failed to get AI analysis' });
    }
    setAiLoading(false);
  };

  const allFields = feature.formFields || [];
  const displayFields = allFields.length > 0
    ? allFields
    : feature.columns.map((c, i) => ({ key: c, label: feature.displayColumns[i] || c }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h2>{feature.icon} Record Details</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            {displayFields.map((field) => {
              const value = item[field.key];
              if (value == null || value === '') return null;
              const isLong = field.type === 'textarea' || String(value).length > 60;
              return (
                <div key={field.key} className={`detail-item ${isLong ? 'full-width' : ''}`}>
                  <div className="detail-label">{field.label}</div>
                  <div className="detail-value">{String(value)}</div>
                </div>
              );
            })}
            {item.created_at && (
              <div className="detail-item">
                <div className="detail-label">Created</div>
                <div className="detail-value">{new Date(item.created_at).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          {aiLoading && (
            <div className="ai-loading" style={{ marginTop: 20 }}>
              <div className="spinner" />
              <span>AI is analyzing this record...</span>
            </div>
          )}

          {aiResult && !aiLoading && (
            <div className="ai-output-container">
              <div className="ai-output-header">
                <span className="ai-badge">AI</span>
                <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>Analysis Result</span>
                {aiResult.model && <span className="ai-model">Model: {aiResult.model}</span>}
              </div>
              <div className="ai-output-body">
                {aiResult.success !== false ? (
                  <ReactMarkdown>{aiResult.result}</ReactMarkdown>
                ) : (
                  <p style={{ color: '#f87171' }}>{aiResult.result}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-action btn-ai" onClick={handleAnalyze} disabled={aiLoading}>
            {aiLoading ? 'Analyzing...' : '🤖 AI Analyze'}
          </button>
          <button className="btn-action btn-edit" onClick={onEdit}>Edit</button>
          <button className="btn-action btn-delete" onClick={onDelete}>Delete</button>
          <button className="btn-action btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

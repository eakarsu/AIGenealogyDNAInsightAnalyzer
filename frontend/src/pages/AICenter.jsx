import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../api';
import AIReport from '../components/AIReport';

const promptExamples = [
  { label: 'Migration records', prompt: 'Compare an 1851 New York passenger arrival for a Murphy family from County Galway with an 1860 Boston census household. What names, ages, and locations should I verify before linking them?' },
  { label: 'DNA match', prompt: 'A match shares 120 cM across 8 segments with my maternal line. Explain plausible relationships, what this evidence cannot prove, and which family records could narrow the possibilities.' },
  { label: 'Source review', prompt: 'I have an 1880 Chicago census entry and an 1892 marriage record for someone named O\'Sullivan. Give me a source comparison checklist and explain how to handle conflicting birth years.' },
];

export default function AICenter() {
  const [aiFeatures, setAiFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet('/ai-center/features');
        setAiFeatures(Array.isArray(data) ? data : []);
      } catch {
        setAiFeatures([]);
      }
    };
    load();
  }, []);

  const handleQuery = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = selectedFeature
        ? await apiPost('/ai-center/query', { featureId: selectedFeature.id, prompt })
        : await apiPost('/ai-center/general', { prompt });
      setResult(data);
    } catch (err) {
      if (err.message && err.message.includes('Rate limit')) {
        showToast(err.message);
      } else {
        showToast('Failed to query AI. Please try again.');
      }
      setResult({ success: false, result: err.message || 'Failed to query AI' });
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleQuery();
    }
  };

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxWidth: 480, fontSize: 14,
        }}>
          {toast.msg}
        </div>
      )}
      <div className="ai-center-header">
        <h1>AI Research Center</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Access all AI-powered genealogy research tools in one place. Select a specialty or ask any question.
        </p>
      </div>

      <div className="ai-features-grid">
        {aiFeatures.map((f) => (
          <div
            key={f.id}
            className={`ai-feature-card ${selectedFeature?.id === f.id ? 'selected' : ''}`}
            onClick={() => setSelectedFeature(selectedFeature?.id === f.id ? null : f)}
          >
            <div className="icon">{f.icon}</div>
            <div className="name">{f.name}</div>
            <div className="desc">{f.description}</div>
          </div>
        ))}
      </div>

      <div className="ai-query-section">
        <h3>
          {selectedFeature ? `Ask ${selectedFeature.name}` : 'Ask AI Genealogy Assistant'}
        </h3>
        <div className="ai-preset-bar"><strong>Sample questions</strong><div className="ai-actions">{promptExamples.map((example) => <button key={example.label} type="button" className="btn btn-secondary" disabled={loading} onClick={() => { setPrompt(example.prompt); setResult(null); }}>{example.label}</button>)}</div></div>
        <div className="ai-query-input">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFeature
                ? `Ask about ${selectedFeature.name.toLowerCase()}... (Cmd+Enter to send)`
                : 'Ask any genealogy or DNA question... (Cmd+Enter to send)'
            }
          />
          <button onClick={handleQuery} disabled={loading || !prompt.trim()}>
            {loading ? 'Analyzing...' : 'Ask AI'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="ai-loading" style={{ marginTop: 20 }}>
          <div className="spinner" />
          <span>AI is analyzing your question...</span>
        </div>
      )}

      {result && !loading && (
        <div className="ai-output-container" style={{ marginTop: 20 }}>
          <div className="ai-output-header">
            <span className="ai-badge">AI</span>
            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>
              {result.feature || 'General Assistant'}
            </span>
            {result.model && <span className="ai-model">Model: {result.model}</span>}
            {result.usage && (
              <span className="ai-model">
                Tokens: {result.usage.prompt_tokens + result.usage.completion_tokens}
              </span>
            )}
          </div>
          <div className="ai-output-body">
            {result.success !== false ? (
              <AIReport response={result} title={result.feature || 'Genealogy analysis'} />
            ) : (
              <p style={{ color: '#f87171' }}>{result.result}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

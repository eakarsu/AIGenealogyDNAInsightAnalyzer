import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../api';
import ReactMarkdown from 'react-markdown';

export default function AICenter() {
  const [aiFeatures, setAiFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setResult({ success: false, result: 'Failed to query AI' });
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
              <ReactMarkdown>{result.result}</ReactMarkdown>
            ) : (
              <p style={{ color: '#f87171' }}>{result.result}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

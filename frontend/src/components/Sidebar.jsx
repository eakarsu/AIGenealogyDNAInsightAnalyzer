import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { features } from '../features';

export default function Sidebar({ open, onToggle, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${open ? '' : 'collapsed'}`}>
      <button className="sidebar-toggle" onClick={onToggle}>
        {open ? '\u2039' : '\u203A'}
      </button>

      <div className="sidebar-header">
        <span className="logo">🧬</span>
        {open && (
          <div className="title">
            <div style={{ fontSize: 14, fontWeight: 700 }}>DNA Insight</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Analyzer</div>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        {open && <div className="sidebar-section-title">Main</div>}
        <div
          className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="icon">📊</span>
          {open && <span className="label">Dashboard</span>}
        </div>
        <div
          className={`sidebar-link ${isActive('/ai-center') ? 'active' : ''}`}
          onClick={() => navigate('/ai-center')}
        >
          <span className="icon">🤖</span>
          {open && <span className="label">AI Research Center</span>}
        </div>
        <div
          className={`sidebar-link ${isActive('/ai-structured-tools') ? 'active' : ''}`}
          onClick={() => navigate('/ai-structured-tools')}
        >
          <span className="icon">🧪</span>
          {open && <span className="label">AI Structured Tools</span>}
        </div>
        <div
          className={`sidebar-link ${isActive('/ai-history') ? 'active' : ''}`}
          onClick={() => navigate('/ai-history')}
        >
          <span className="icon">📋</span>
          {open && <span className="label">AI History</span>}
        </div>
      </div>

      <div className="sidebar-section">
        {open && <div className="sidebar-section-title">DNA Analysis</div>}
        {features.filter(f => ['ethnicity', 'haplogroups', 'traits', 'dna-matches', 'health-risks'].includes(f.id)).map((f) => (
          <div
            key={f.id}
            className={`sidebar-link ${isActive(`/feature/${f.id}`) ? 'active' : ''}`}
            onClick={() => navigate(`/feature/${f.id}`)}
          >
            <span className="icon">{f.icon}</span>
            {open && <span className="label">{f.name}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        {open && <div className="sidebar-section-title">Family Research</div>}
        {features.filter(f => ['ancestors', 'relationships', 'timelines', 'documents', 'surnames'].includes(f.id)).map((f) => (
          <div
            key={f.id}
            className={`sidebar-link ${isActive(`/feature/${f.id}`) ? 'active' : ''}`}
            onClick={() => navigate(`/feature/${f.id}`)}
          >
            <span className="icon">{f.icon}</span>
            {open && <span className="label">{f.name}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        {open && <div className="sidebar-section-title">Heritage & Culture</div>}
        {features.filter(f => ['migration', 'culture', 'recipes', 'ancient', 'reports'].includes(f.id)).map((f) => (
          <div
            key={f.id}
            className={`sidebar-link ${isActive(`/feature/${f.id}`) ? 'active' : ''}`}
            onClick={() => navigate(`/feature/${f.id}`)}
          >
            <span className="icon">{f.icon}</span>
            {open && <span className="label">{f.name}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{(user.name || 'U')[0].toUpperCase()}</div>
          {open && (
            <div>
              <div className="name">{user.name || 'User'}</div>
              <div className="email">{user.email || ''}</div>
            </div>
          )}
        </div>
        {open && <button className="btn-logout" onClick={onLogout}>Sign Out</button>}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { features } from '../features';
import { apiGet } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const loadStats = async () => {
      const counts = {};
      for (const f of features) {
        try {
          const data = await apiGet(f.apiPath);
          counts[f.id] = Array.isArray(data) ? data.length : 0;
        } catch {
          counts[f.id] = 0;
        }
      }
      setStats(counts);
    };
    loadStats();
  }, []);

  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome back, {user.name || 'Explorer'}</h1>
        <p>Your AI-powered genealogy research hub with {features.length} specialized features</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{features.length}</div>
          <div className="stat-label">AI Features</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">18</div>
          <div className="stat-label">AI Models Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">5</div>
          <div className="stat-label">Generations Mapped</div>
        </div>
      </div>

      <div className="cards-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="feature-card"
            style={{ '--card-color': feature.color }}
            onClick={() => navigate(`/feature/${feature.id}`)}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: feature.color }} />
            <div className="card-icon">{feature.icon}</div>
            <div className="card-title">{feature.name}</div>
            <div className="card-desc">{feature.description}</div>
            <div className="card-badge">
              {stats[feature.id] !== undefined ? `${stats[feature.id]} records` : 'Loading...'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

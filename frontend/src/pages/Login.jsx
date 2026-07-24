import React, { useState } from 'react';
import { apiPost } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };
      const data = await apiPost(endpoint, body);
      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin();
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🧬</div>
        <h1 className="login-title">AI Genealogy DNA</h1>
        <p className="login-subtitle">Insight Analyzer</p>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button
            type="button"
            onClick={() => { setEmail(import.meta.env.VITE_DEMO_EMAIL || ''); setPassword(import.meta.env.VITE_DEMO_PASSWORD || ''); }}
            disabled={!import.meta.env.VITE_DEMO_EMAIL || !import.meta.env.VITE_DEMO_PASSWORD}
            aria-label="Auto Fill Demo Credentials"
            style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
          >
            Auto Fill Demo Credentials
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button
          className="btn-autofill"
          style={{ marginTop: 8 }}
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
        >
          {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

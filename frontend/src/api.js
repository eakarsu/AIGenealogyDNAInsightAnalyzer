const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: getHeaders() });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 429) {
    throw new Error('Rate limit exceeded. You can make up to 20 AI requests per hour. Please try again later.');
  }
  if (res.status === 503) {
    let info = {};
    try { info = await res.json(); } catch (_) {}
    throw new Error(info.error || 'AI service unavailable (OPENROUTER_API_KEY not configured).');
  }
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}

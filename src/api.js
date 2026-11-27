async function request(url, options = {}) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getEmployees: (search = '') =>
    request(`/api/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getDashboard: () => request('/api/dashboard'),

  verify: (token) => request(`/api/verify/${encodeURIComponent(token)}`),

  saveEmployee: (id, formData) =>
    request(id ? `/api/employees/${id}` : '/api/employees', {
      method: id ? 'PUT' : 'POST',
      body: formData,
    }),

  deleteEmployee: (id) =>
    request(`/api/employees/${id}`, { method: 'DELETE' }),

  bulkDeleteEmployees: (ids) =>
    request('/api/employees/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }),

  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  me: () => request('/api/auth/me'),
};

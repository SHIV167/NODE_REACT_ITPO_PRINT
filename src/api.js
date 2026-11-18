async function request(url, options = {}) {
  const res = await fetch(url, options);
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
};

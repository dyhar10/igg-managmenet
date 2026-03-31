const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function buildHeaders(token, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && payload && payload.message ? payload.message : response.statusText;
    const error = new Error(message || 'Permintaan gagal');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse(response);
}

export function login(payload) {
  return request('/api/auth/login', { method: 'POST', body: payload });
}

export function register(payload) {
  return request('/api/auth/register', { method: 'POST', body: payload });
}

export function resetPassword(payload) {
  return request('/api/auth/reset-password', { method: 'POST', body: payload });
}

export function fetchUsers(token) {
  return request('/api/users', { token });
}

export function fetchRoles(token) {
  return request('/api/roles', { token });
}

export function updateUserRoles({ userId, roles, token }) {
  return request('/api/users/roles', { method: 'PATCH', body: { userId, roles }, token });
}

export function fetchDashboard({ houseId, token } = {}) {
  const url = new URL('/api/cash-dashboard', API_BASE_URL);
  if (houseId) {
    url.searchParams.set('houseId', houseId);
  }
  return handleFetch(url, { token });
}

async function handleFetch(url, { method = 'GET', body, token } = {}) {
  const response = await fetch(url, {
    method,
    headers: buildHeaders(token),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
}

export function fetchTransactions({ filters = {}, token } = {}) {
  const url = new URL('/api/cash-transactions', API_BASE_URL);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return handleFetch(url, { token });
}

export function createTransaction({ data, token }) {
  return request('/api/cash-transactions', { method: 'POST', body: data, token });
}

export function fetchHouses(token) {
  return request('/api/houses', { token });
}

export function createHouse({ data, token }) {
  return request('/api/houses', { method: 'POST', body: data, token });
}

export function updateHouse({ id, data, token }) {
  return request(`/api/houses/${id}`, { method: 'PUT', body: data, token });
}

export function deleteHouse({ id, token }) {
  return request(`/api/houses/${id}`, { method: 'DELETE', token });
}

export function generateFees({ data, token }) {
  return request('/api/fees/generate', { method: 'POST', body: data, token });
}

export function fetchFees({ filters = {}, token } = {}) {
  const url = new URL('/api/fees', API_BASE_URL);
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });
  return handleFetch(url, { token });
}

export function updateFeeStatus({ id, data, token }) {
  return request(`/api/fees/${id}`, { method: 'PATCH', body: data, token });
}

export function fetchHouseMap({ year, month, token }) {
  const url = new URL('/api/fees/map', API_BASE_URL);
  url.searchParams.set('year', year);
  url.searchParams.set('month', month);
  return handleFetch(url, { token });
}

// ─── API BASE CONFIG ───────────────────────────────────────────
const BASE_URL = 'http://localhost:8000/api';

// ─── TOKEN HELPERS ─────────────────────────────────────────────
export const getToken = () => localStorage.getItem('access_token');
export const getRefresh = () => localStorage.getItem('refresh_token');

export const saveTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);

  if (refresh) {
    localStorage.setItem('refresh_token', refresh);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ─── HTTP CLIENT ───────────────────────────────────────────────
async function request(method, path, body = null, auth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // 401 → try refresh token
return parseResponse(res);
}

async function parseResponse(res) {
  const text = await res.text();

  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw {
      status: res.status,
      data,
    };
  }

  return data;
}

// ─── TOKEN REFRESH ─────────────────────────────────────────────
async function tryRefresh() {
  const refresh = getRefresh();

  if (!refresh) return false;

  try {
    const res = await fetch(
      `${BASE_URL}/users/token/refresh/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      }
    );

    if (!res.ok) return false;

    const data = await res.json();

    saveTokens(data.access, data.refresh);

    return true;

  } catch {
    return false;
  }
}

// ─── MULTIPART REQUESTS ────────────────────────────────────────
async function requestForm(method, path, formData) {
  const token = getToken();

  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log("TOKEN SENT:", token);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  return parseResponse(res);
}
// ─── AUTH ENDPOINTS ────────────────────────────────────────────
export const auth = {
  login: (username, password) =>
    request(
      'POST',
      '/users/login/',
      { username, password },
      false
    ),

  register: (data) =>
    request(
      'POST',
      '/users/register/',
      data,
      false
    ),

  me: () =>
    request(
      'GET',
      '/users/me/'
    ),

  updateProfile: (formData) =>
    requestForm(
      'PUT',
      '/users/update/',
      formData
    ),
    
  logout: () =>
    request(
      'POST',
      '/users/logout/'
    ),
};

// ─── PRODUCT ENDPOINTS ─────────────────────────────────────────
export const products = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();

    return request(
      'GET',
      `/listings/?${qs}`,
      null,
      false
    );
  },

  get: (id) =>
    request(
      'GET',
      `/listings/${id}/`,
      null,
      false
    ),

  create: (formData) =>
    requestForm(
      'POST',
      '/listings/',
      formData
    ),

  update: (id, formData) =>
    requestForm(
      'PATCH',
      `/listings/${id}/`,
      formData
    ),

  delete: (id) =>
    request(
      'DELETE',
      `/listings/${id}/`
    ),

  myProducts: () =>
    request(
      'GET',
      '/listings/my/'
    ),
};

// ─── CATEGORY ENDPOINTS ────────────────────────────────────────
export const categories = {
  list: () =>
    request(
      'GET',
      '/listings/categories/',
      null,
      false
    ),
};

export default {
  auth,
  products,
  categories,
};
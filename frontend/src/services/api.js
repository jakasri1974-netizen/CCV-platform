const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('blockcert_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'API request failed');
  }

  return result;
}

// Real Auth API
export const authApi = {
  register: (data) => apiRequest('/auth/register', 'POST', data),
  verifyEmail: (data) => apiRequest('/auth/verify-email', 'POST', data),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', 'POST', data),
  resetPassword: (data) => apiRequest('/auth/reset-password', 'POST', data),
  setupPassword: (data) => apiRequest('/auth/setup-password', 'POST', data),
  getMe: () => apiRequest('/auth/me', 'GET'),
};

// Colleges API
export const collegeApi = {
  getAll: (params = '') => apiRequest(`/colleges?${params}`, 'GET'),
  getById: (id) => apiRequest(`/colleges/${id}`, 'GET'),
  create: (data) => apiRequest('/colleges', 'POST', data),
  createAdmin: (collegeId, data) => apiRequest(`/colleges/${collegeId}/admin`, 'POST', data),
};

// Departments API
export const departmentApi = {
  getAll: (params = '') => apiRequest(`/departments?${params}`, 'GET'),
  create: (data) => apiRequest('/departments', 'POST', data),
};

// Students API
export const studentApi = {
  getAll: (params = '') => apiRequest(`/students?${params}`, 'GET'),
  getById: (id) => apiRequest(`/students/${id}`, 'GET'),
  create: (data) => apiRequest('/students', 'POST', data),
  importCsv: (data) => apiRequest('/students/import', 'POST', data),
  update: (id, data) => apiRequest(`/students/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/students/${id}`, 'DELETE'),
};

// Courses API
export const courseApi = {
  getAll: (params = '') => apiRequest(`/courses?${params}`, 'GET'),
  getById: (id) => apiRequest(`/courses/${id}`, 'GET'),
  create: (data) => apiRequest('/courses', 'POST', data),
  update: (id, data) => apiRequest(`/courses/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/courses/${id}`, 'DELETE'),
};

// Certificates API
export const certificateApi = {
  getAll: (params = '') => apiRequest(`/certificates?${params}`, 'GET'),
  getById: (id) => apiRequest(`/certificates/${id}`, 'GET'),
  prepare: (data) => apiRequest('/certificates/prepare', 'POST', data),
  confirm: (data) => apiRequest('/certificates/confirm', 'POST', data),
  revoke: (id, data) => apiRequest(`/certificates/${id}/revoke`, 'POST', data),
};

// Merkle Batches API
export const batchApi = {
  getAll: (params = '') => apiRequest(`/batches?${params}`, 'GET'),
  getById: (batchId) => apiRequest(`/batches/${batchId}`, 'GET'),
  create: (data) => apiRequest('/batches', 'POST', data),
  generateRoot: (batchId) => apiRequest(`/batches/${batchId}/generate-root`, 'POST'),
  anchor: (batchId, data) => apiRequest(`/batches/${batchId}/anchor`, 'POST', data),
};

// Public Verification API
export const verifyApi = {
  verify: (certificateId) => apiRequest(`/verify/${certificateId}`, 'GET'),
};

// Document Upload & IPFS API
export const documentApi = {
  upload: async (formData) => {
    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Document upload failed');
    return result;
  },
  getByStudent: (studentId) => apiRequest(`/documents/student/${studentId}`, 'GET'),
  verifyFile: async (formData) => {
    const response = await fetch(`${API_BASE}/documents/verify-file`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'File verification failed');
    return result;
  },
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: () => apiRequest('/dashboard/stats', 'GET'),
};

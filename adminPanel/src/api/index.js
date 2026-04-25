import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Do not intercept 401s for the login endpoint
    if (originalRequest.url.includes('/auth/login/')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', res.data.access);
          localStorage.setItem('refresh_token', res.data.refresh);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
};

// ─── Users API ───
export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  get: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
  toggleActive: (id) => api.post(`/users/${id}/toggle_active/`),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
  getMyPermissions: () => api.get('/users/my-permissions/'),
  getDashboardStats: () => api.get('/users/dashboard-stats/'),
};

// ─── Roles API ───
export const rolesAPI = {
  list: () => api.get('/roles/'),
  get: (id) => api.get(`/roles/${id}/`),
  getAllRoles: () => api.get('/roles/'),
  getModules: () => api.get('/roles/modules/'),
  createRole: (data) => api.post('/roles/', data),
  updateRole: (id, data) => api.patch(`/roles/${id}/`, data),
  deleteRole: (id) => api.delete(`/roles/${id}/`),
};

// ─── Schemes API ───
export const schemesAPI = {
  list: (params) => api.get('/schemes/', { params }),
  get: (id) => api.get(`/schemes/${id}/`),
  create: (data) => api.post('/schemes/', data),
  update: (id, data) => api.patch(`/schemes/${id}/`, data),
  delete: (id) => api.delete(`/schemes/${id}/`),
};

// ─── Scheme Templates API ───
export const schemeTemplatesAPI = {
  list: (params) => api.get('/scheme-templates/', { params }),
  get: (id) => api.get(`/scheme-templates/${id}/`),
  create: (data) => api.post('/scheme-templates/', data),
  update: (id, data) => api.patch(`/scheme-templates/${id}/`, data),
  delete: (id) => api.delete(`/scheme-templates/${id}/`),
};

// ─── Scheme Template Entries API ───
export const schemeTemplateEntriesAPI = {
  list: (params) => api.get('/scheme-template-entries/', { params }),
  get: (id) => api.get(`/scheme-template-entries/${id}/`),
  create: (data) => api.post('/scheme-template-entries/', data),
  update: (id, data) => api.patch(`/scheme-template-entries/${id}/`, data),
  delete: (id) => api.delete(`/scheme-template-entries/${id}/`),
};

// ─── Scheme Entry Comments API ───
export const schemeEntryCommentsAPI = {
  list: (params) => api.get('/scheme-entry-comments/', { params }),
  create: (data) => api.post('/scheme-entry-comments/', data),
  delete: (id) => api.delete(`/scheme-entry-comments/${id}/`),
};

// ─── Scheme Categories API ───
export const schemeCategoriesAPI = {
  list: () => api.get('/scheme-categories/'),
  create: (data) => api.post('/scheme-categories/', data),
  update: (id, data) => api.patch(`/scheme-categories/${id}/`, data),
  delete: (id) => api.delete(`/scheme-categories/${id}/`),
};

// ─── Public Site Settings API ───
export const publicSettingsAPI = {
  current: () => api.get('/public/settings/current/'),
  update: (data) => api.patch('/public/settings/1/', data),
};

// ─── Public News API (Public - No Auth Required) ───
export const publicNewsAPI = {
  list: (params) => api.get('/public/news/', { params }),
  get: (id) => api.get(`/public/news/${id}/`),
  featured: () => api.get('/public/news/featured/'),
};

// ─── News Admin API (Admin - Auth Required) ───
export const newsAdminAPI = {
  list: (params) => api.get('/public/admin/news/', { params }),
  get: (id) => api.get(`/public/admin/news/${id}/`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/public/admin/news/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.patch(`/public/admin/news/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/public/admin/news/${id}/`),
  publish: (id) => api.post(`/public/admin/news/${id}/publish/`),
  unpublish: (id) => api.post(`/public/admin/news/${id}/unpublish/`),
  toggleFeatured: (id) => api.post(`/public/admin/news/${id}/toggle_featured/`),
};

export default api;

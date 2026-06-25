import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function resolveMediaUrl(value) {
  if (!value) return '';

  try {
    return new URL(value, API_ORIGIN).toString();
  } catch {
    return value;
  }
}

export const publicSettingsAPI = {
  current: () => api.get('/public/settings/current/'),
};

export const publicNewsAPI = {
  list: (params) => api.get('/public/news/', { params }),
  get: (id) => api.get(`/public/news/${id}/`),
  featured: () => api.get('/public/news/featured/'),
};

export const publicFeedbacksAPI = {
  list: (params) => api.get('/public/feedbacks/', { params }),
  featured: () => api.get('/public/feedbacks/featured/'),
};

export const publicTeamAPI = {
  list: (params) => api.get('/public/team/', { params }),
  featured: () => api.get('/public/team/featured/'),
};

export const publicPortfolioAPI = {
  unionCouncils: (params) => api.get('/public/portfolio/union-councils/', { params }),
  categories: (params) => api.get('/public/portfolio/categories/', { params }),
  schemes: (params) => api.get('/public/portfolio/schemes/', { params }),
  scheme: (id) => api.get(`/public/portfolio/schemes/${id}/`),
};

export const publicComplaintsAPI = {
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/public/complaints/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  track: (params) => api.get('/public/complaints/track/', { params }),
};

export default api;

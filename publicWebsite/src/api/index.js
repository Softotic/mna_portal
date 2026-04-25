import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const publicSettingsAPI = {
  current: () => api.get('/public/settings/current/'),
};

export const publicNewsAPI = {
  list: (params) => api.get('/public/news/', { params }),
  get: (id) => api.get(`/public/news/${id}/`),
  featured: () => api.get('/public/news/featured/'),
};

export default api;

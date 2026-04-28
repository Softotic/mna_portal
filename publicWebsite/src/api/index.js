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

export const publicFeedbacksAPI = {
  list: (params) => api.get('/public/feedbacks/', { params }),
  featured: () => api.get('/public/feedbacks/featured/'),
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

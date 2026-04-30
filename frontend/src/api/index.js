import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Users
export const usersAPI = {
  list: (userType) => api.get('/users', { params: { user_type: userType } }),
  get: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Demands
export const demandsAPI = {
  list: (params) => api.get('/demands', { params }),
  get: (id) => api.get(`/demands/${id}`),
  create: (data) => api.post('/demands', data),
  myList: () => api.get('/demands/my/list'),
  updateStatus: (id, data) => api.patch(`/demands/${id}/status`, data),
};

// Proposals
export const proposalsAPI = {
  getForDemand: (demandId) => api.get(`/demands/${demandId}/proposals`),
  create: (data) => api.post('/proposals', data),
  myList: () => api.get('/proposals/my/list'),
  updateStatus: (id, data) => api.patch(`/proposals/${id}/status`, data),
};

// Messages
export const messagesAPI = {
  send: (data) => api.post('/messages', data),
  getForDemand: (demandId) => api.get(`/demands/${demandId}/messages`),
  getConversations: () => api.get('/messages/conversations'),
};

// Ratings
export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  getForUser: (userId) => api.get(`/users/${userId}/ratings`),
};

// Search
export const searchAPI = {
  artisans: (params) => api.get('/artisans/search', { params }),
};

// Stats
export const statsAPI = {
  dashboard: () => api.get('/stats/dashboard'),
};

export default api;

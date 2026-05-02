import axios from 'axios';

const api = axios.create({
  baseURL: window.API_URL || '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;

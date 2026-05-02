import axios from 'axios';

const api = axios.create({
  baseURL: window.API_URL || '/api',
  withCredentials: true,
  withXSRFToken: true,
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
  if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('auth_token');
      // Only clear and redirect if we actually had a token (session expired)
      // and we are not already on the login page
      if (token && window.location.pathname !== '/login') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login?session_expired=1';
      }
  }
  return Promise.reject(error);
});

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vocallet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token expiration (e.g., logout or refresh token)
      console.warn('Unauthorized access, token might be invalid or expired.');
      // You could also redirect to login here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

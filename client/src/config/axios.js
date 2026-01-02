import axios from 'axios';

// Configure axios base URL
// In development, uses the proxy configured in package.json
// In production, use the actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Don't remove token if we're on verify-email page (user might be setting password)
      const currentPath = window.location.pathname;
      if (currentPath !== '/verify-email') {
        localStorage.removeItem('token');
        delete apiClient.defaults.headers.common['Authorization'];
        // Redirect to login if not already there
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      } else {
        console.log('⚠️ 401 error on verify-email page - keeping token for password setup');
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be slow or unavailable');
    } else if (!error.response) {
      console.error('Network error - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;






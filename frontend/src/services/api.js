import axios from 'axios';

const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10-second SLA threshold fallback for remote Supabase DB network resilience
});

// Request Interceptor: Attach Bearer Token if logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Session Expiration & Network Errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user session if unauthorized
      localStorage.removeItem('tv_token');
      localStorage.removeItem('tv_user');
      window.dispatchEvent(new Event('tv_auth_unauthorized'));
    }
    
    // Provide clean diagnostic message for network failures
    let message = error?.response?.data?.detail;
    if (!message) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = 'Cannot connect to backend server at http://127.0.0.1:8000. Please ensure FastAPI backend is running.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

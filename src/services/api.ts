import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 Unauthorized and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh-token`,
          { refreshToken }
        );
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle specific error status codes
    switch (error.response?.status) {
      case 400:
        toast.error('Invalid request. Please check your input.');
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 422:
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach((message: any) => {
            toast.error(message as string);
          });
        } else {
          toast.error('Validation failed. Please check your input.');
        }
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('An unexpected error occurred. Please try again later.');
        break;
      default:
        if (!navigator.onLine) {
          toast.error('You are offline. Please check your internet connection.');
        } else {
          toast.error('An error occurred. Please try again.');
        }
    }
    
    // Handle offline status
    if (error.message === 'Network Error') {
      console.log('Network error - possibly offline');
      // Here you would implement your offline handling strategy
      // For example, queue the request to be retried later
    }
    
    return Promise.reject(error);
  }
);
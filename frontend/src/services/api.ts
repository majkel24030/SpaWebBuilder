import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Create Axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // If token is expired or invalid, logout the user
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.detail 
      || error.message 
      || 'Wystąpił nieoczekiwany błąd';
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * General API request function
 */
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Wystąpił nieoczekiwany błąd');
  }
};

export default api;

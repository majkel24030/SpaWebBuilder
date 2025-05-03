import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Create axios instance with base URL and credentials
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * General API request function
 */
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api(config);
    // For 204 No Content responses with DELETE method, return undefined as T
    if (response.status === 204 && config.method?.toUpperCase() === 'DELETE') {
      return undefined as unknown as T;
    }
    return response.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export default api;
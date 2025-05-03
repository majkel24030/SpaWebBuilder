import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { request } from './api';

/**
 * Login user with credentials
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await request<AuthResponse>({
    url: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: formData
  });

  // Store token and user in localStorage
  localStorage.setItem('token', response.access_token);
  localStorage.setItem('user', JSON.stringify(response.user));

  return response;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await request<AuthResponse>({
    url: '/auth/register',
    method: 'POST',
    data: {
      email: data.email,
      password: data.password,
      full_name: data.full_name
    }
  });

  // Store token and user in localStorage
  localStorage.setItem('token', response.access_token);
  localStorage.setItem('user', JSON.stringify(response.user));

  return response;
};

/**
 * Logout - client side only
 * We don't need to call the backend as we're using JWT
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    return await request<User>({
      url: '/users/me',
      method: 'GET'
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    logout();
    throw error;
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (role?: string): boolean => {
  return role === 'admin';
};
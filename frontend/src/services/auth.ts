import { LoginCredentials, RegisterData, AuthResponse } from '../types';
import { request } from './api';

/**
 * Login user with credentials
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return request<AuthResponse>({
    method: 'POST',
    url: '/auth/login',
    data: credentials,
  });
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  return request<AuthResponse>({
    method: 'POST',
    url: '/auth/register',
    data,
  });
};

/**
 * Logout - client side only
 * We don't need to call the backend as we're using JWT
 */
export const logout = (): void => {
  // Nothing to do here, token will be cleared by the store
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return request({
    method: 'GET',
    url: '/users/me'
  });
};

/**
 * Check if user is admin
 */
export const isAdmin = (role?: string): boolean => {
  return role === 'admin';
};

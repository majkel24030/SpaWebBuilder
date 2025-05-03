import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isAdmin } from '../services/auth';

/**
 * Custom hook to handle authentication
 */
export const useAuth = () => {
  return useAuthStore(state => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.user ? isAdmin(state.user.role) : false,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    register: state.register,
    logout: state.logout,
    clearError: state.clearError,
  }));
};

/**
 * Hook to require authentication for a page
 * Will redirect to login if not authenticated
 */
export const useRequireAuth = (adminRequired: boolean = false) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (adminRequired && user?.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, adminRequired, user, navigate]);
  
  return { isAuthenticated, user };
};

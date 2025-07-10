import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types';
import { isValidEmail, isValidPassword } from '../utils/validation';

const Register: React.FC = () => {
  const { register: registerUser, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm<RegisterData & { confirmPassword: string }>();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any errors when component mounts
    clearError();
  }, [isAuthenticated, navigate, clearError]);
  
  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    const { confirmPassword, ...registerData } = data;
    await registerUser(registerData);
  };
  
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Utwórz nowe konto
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Lub{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            zaloguj się do istniejącego konta
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <span>{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adres e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full appearance-none rounded-md border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  {...register('email', { 
                    required: 'Email jest wymagany',
                    validate: {
                      validEmail: (value: string) => isValidEmail(value) || 'Niepoprawny format e-mail'
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Imię i nazwisko
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  className={`block w-full appearance-none rounded-md border ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  {...register('full_name', { 
                    required: 'Imię i nazwisko jest wymagane',
                    minLength: {
                      value: 3,
                      message: 'Imię i nazwisko musi mieć co najmniej 3 znaki'
                    }
                  })}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Hasło
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={`block w-full appearance-none rounded-md border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  {...register('password', { 
                    required: 'Hasło jest wymagane',
                    validate: {
                      validPassword: (value: string) => 
                        isValidPassword(value) || 
                        'Hasło musi mieć co najmniej 8 znaków, jedną literę i jedną cyfrę'
                    }
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Powtórz hasło
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  className={`block w-full appearance-none rounded-md border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  {...register('confirmPassword', { 
                    required: 'Powtórz hasło',
                    validate: {
                      matchesPassword: (value: string) => {
                        const password = watch('password');
                        return password === value || 'Hasła nie są zgodne';
                      }
                    }
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

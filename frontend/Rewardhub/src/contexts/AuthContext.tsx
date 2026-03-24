import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isAxiosError } from 'axios';
import type { User, LoginForm, RegisterForm } from '../types/index';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message;
      return message || fallback;
    }
    return fallback;
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      void checkAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = async (data: LoginForm) => {
    try {
      const response = await authService.login(data);
      localStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
      toast.success('Login successful!');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Login failed');
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterForm) => {
    try {
      const response = await authService.register(data);
      localStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
      toast.success('Registration successful!');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Registration failed');
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

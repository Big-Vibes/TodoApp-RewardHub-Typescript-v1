import api from './api';
import type { AuthResponse, LoginForm, RegisterForm, User, ApiResponse } from '../types/index.ts';

export const authService = {
  // Register new user
  async register(data: RegisterForm): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  // Login user
  async login(data: LoginForm): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  // Logout user
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  // Refresh access token
  async refreshToken(): Promise<string> {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return response.data.data!.accessToken;
  },
};

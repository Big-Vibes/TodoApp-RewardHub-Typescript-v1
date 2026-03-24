import api from './api';
import type { DashboardData, LeaderboardResponse, ApiResponse } from '../types/index.ts';

export const dashboardService = {
  // Get dashboard data
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>('/users/dashboard');
    return response.data.data!;
  },

  // Get user rank
  async getUserRank(): Promise<number> {
    const response = await api.get<ApiResponse<{ rank: number }>>('/users/rank');
    return response.data.data!.rank;
  },
};

export const leaderboardService = {
  // Get leaderboard with pagination
  async getLeaderboard(page: number = 1, limit: number = 20): Promise<LeaderboardResponse> {
    const response = await api.get<LeaderboardResponse>('/leaderboard', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get top performers
  async getTopPerformers(limit: number = 10) {
    const response = await api.get('/leaderboard/top', {
      params: { limit },
    });
    return response.data.data;
  },

  // Get leaderboard stats
  async getStats() {
    const response = await api.get('/leaderboard/stats');
    return response.data.data;
  },
};

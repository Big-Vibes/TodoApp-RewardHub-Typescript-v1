import api from './api';
import type {
  Task,
  TaskStats,
  TaskHistory,
  CreateTaskForm,
  ApiResponse,
  Streak,
} from '../types/index.ts';

export const taskService = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks');
    return response.data.data!;
  },

  // Get single task
  async getTask(taskId: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data.data!;
  },

  // Create task
  async createTask(data: CreateTaskForm): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data!;
  },

  // Update task
  async updateTask(taskId: string, data: Partial<CreateTaskForm>): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data.data!;
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  // Complete task
  async completeTask(taskId: string): Promise<{ task: Task; streak: Streak }> {
    const response = await api.post<ApiResponse<{ task: Task; streak: Streak }>>(
      `/tasks/${taskId}/complete`
    );
    return response.data.data!;
  },

  // Get task statistics
  async getTaskStats(): Promise<TaskStats> {
    const response = await api.get<ApiResponse<TaskStats>>('/tasks/stats');
    return response.data.data!;
  },

  // Get task history
  async getTaskHistory(limit: number = 10): Promise<TaskHistory[]> {
    const response = await api.get<ApiResponse<TaskHistory[]>>('/tasks/history', {
      params: { limit },
    });
    return response.data.data!;
  },

  // Get daily points earned
  async getDailyPoints(): Promise<{
    dailyPoints: number;
    dailyLimit: number;
    remaining: number;
    percentComplete: number;
  }> {
    const response = await api.get<
      ApiResponse<{
        dailyPoints: number;
        dailyLimit: number;
        remaining: number;
        percentComplete: number;
      }>
    >('/tasks/daily-points');
    return response.data.data!;
  },
};

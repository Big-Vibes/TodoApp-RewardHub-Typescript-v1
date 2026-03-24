import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import type { Task, DashboardData } from '../types';
import { taskService } from '../services/task.service';
import { dashboardService } from '../services/dashboard.service';
import toast from 'react-hot-toast';

// Hook to fetch and manage tasks
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return (error.response?.data as { message?: string } | undefined)?.message || fallback;
    }
    return fallback;
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load tasks'));
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const completeTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      await fetchTasks(); // Refresh tasks
      toast.success('Task completed! 🎉');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to complete task'));
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      await fetchTasks(); // Refresh tasks
      toast.success('Task deleted');
    } catch (err: unknown) {
      toast.error('Failed to delete task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    completeTask,
    deleteTask,
  };
};

// Hook to fetch dashboard data
export const useDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return (error.response?.data as { message?: string } | undefined)?.message || fallback;
    }
    return fallback;
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    fetchDashboard,
  };
};

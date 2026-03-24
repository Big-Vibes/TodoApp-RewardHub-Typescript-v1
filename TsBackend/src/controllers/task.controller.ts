import type { NextFunction, Request, Response } from 'express';
import { StreakService } from '../services/streak.service.js';
import { TaskService } from '../services/task.service.js';
import { successResponse } from '../utils/helpers.js';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const tasks = await TaskService.getUserTasks(req.user.userId);
      res.status(200).json(successResponse(tasks));
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { taskId } = req.params as { taskId: string };
      const task = await TaskService.getTaskById(taskId, req.user.userId);
      res.status(200).json(successResponse(task));
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      res.status(403).json({
        success: false,
        message: 'Custom task creation is disabled. Use the default task checklist.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      res.status(403).json({
        success: false,
        message: 'Task editing is disabled. Default checklist tasks are read-only.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      res.status(403).json({
        success: false,
        message: 'Task deletion is disabled. Default checklist tasks are permanent.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { taskId } = req.params as { taskId: string };
      const { task, pointsAwarded } = await TaskService.completeTask(taskId, req.user.userId);
      const streak = await StreakService.updateStreak(req.user.userId);

      res.status(200).json(
        successResponse(
          {
            task,
            streak: {
              currentStreak: streak.currentStreak,
              longestStreak: streak.longestStreak,
            },
          },
          `Task completed! +${pointsAwarded} points`
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTaskStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const stats = await TaskService.getTaskStats(req.user.userId);
      res.status(200).json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  static async getTaskHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const limit = Number.parseInt(String(req.query.limit ?? '10'), 10) || 10;
      const history = await TaskService.getTaskHistory(req.user.userId, limit);
      res.status(200).json(successResponse(history));
    } catch (error) {
      next(error);
    }
  }

  static async getDailyPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const dailyPoints = await TaskService.getDailyPointsEarned(req.user.userId);

      res.status(200).json(
        successResponse({
          dailyPoints,
          dailyLimit: 1000,
          remaining: Math.max(0, 1000 - dailyPoints),
          percentComplete: Math.min(100, (dailyPoints / 1000) * 100),
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

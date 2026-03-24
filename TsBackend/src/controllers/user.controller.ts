import type { NextFunction, Request, Response } from 'express';
import { paginatedResponse, successResponse } from '../utils/helpers.js';
import { LeaderboardService, UserService } from '../services/user.service.js';

export class UserController {
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const dashboard = await UserService.getDashboardStats(req.user.userId);
      res.status(200).json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const profile = await UserService.getUserProfile(req.user.userId);
      res.status(200).json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  static async getRank(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const rank = await UserService.getUserRank(req.user.userId);
      res.status(200).json(successResponse({ rank }));
    } catch (error) {
      next(error);
    }
  }
}

export class LeaderboardController {
  static async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
      const limit = Number.parseInt(String(req.query.limit ?? '20'), 10) || 20;

      const result = await LeaderboardService.getLeaderboard(page, limit);
      res.status(200).json(paginatedResponse(result.leaderboard, page, limit, result.total));
    } catch (error) {
      next(error);
    }
  }

  static async getTopPerformers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Number.parseInt(String(req.query.limit ?? '10'), 10) || 10;
      const topPerformers = await LeaderboardService.getTopPerformers(limit);
      res.status(200).json(successResponse(topPerformers));
    } catch (error) {
      next(error);
    }
  }

  static async getLeaderboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await LeaderboardService.getLeaderboardStats();
      res.status(200).json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}


import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { successResponse } from '../utils/helpers.js';
import { verifyRefreshToken } from '../utils/jwt.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: unknown = req.body;

      const { user, tokens } = await AuthService.register(data);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json(
        successResponse(
          {
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              totalPoints: user.totalPoints,
              currentLevel: user.currentLevel,
            },
            accessToken: tokens.accessToken,
          },
          'User registered successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: unknown = req.body;

      const { user, tokens } = await AuthService.login(data);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(
        successResponse(
          {
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              totalPoints: user.totalPoints,
              currentLevel: user.currentLevel,
            },
            accessToken: tokens.accessToken,
          },
          'Login successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not provided',
        });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      const tokens = await AuthService.refreshAccessToken(refreshToken, payload);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(
        successResponse(
          {
            accessToken: tokens.accessToken,
          },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      res.status(200).json(successResponse(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const user = await AuthService.getUserById(req.user.userId);

      res.status(200).json(
        successResponse({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          totalPoints: user.totalPoints,
          currentLevel: user.currentLevel,
          isActive: user.isActive,
          createdAt: user.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}


import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AuthorizationError } from '../utils/helpers.js';

export const authorize = (...allowedRoles: string[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AuthorizationError('User not authenticated');

      const role = req.user.role;
      if (!role) throw new AuthorizationError('User role not found');

      if (!allowedRoles.includes(role)) {
        throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const adminOnly = authorize('ADMIN');
export const moderatorOrAdmin = authorize('MODERATOR', 'ADMIN');
export const userOnly = authorize('USER');

export const authorizeOwnership = (resourceOwnerIdParam: string = 'userId'): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AuthorizationError('User not authenticated');

      const params = req.params as Record<string, unknown>;
      const body = req.body as Record<string, unknown>;
      const resourceOwnerId = params[resourceOwnerIdParam] ?? body[resourceOwnerIdParam];

      if (req.user.role === 'ADMIN') {
        next();
        return;
      }

      if (req.user.userId !== resourceOwnerId) {
        throw new AuthorizationError('You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AuthenticationError } from '../utils/helpers.js';
import { verifyAccessToken } from '../utils/jwt.js';

const extractBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null;
  if (!authorizationHeader.startsWith('Bearer ')) return null;
  return authorizationHeader.substring(7);
};

const toRequestUser = (payload: unknown): Request['user'] => {
  if (!payload || typeof payload !== 'object') return undefined;
  if (!('userId' in payload)) return undefined;
  const userId = (payload as { userId?: unknown }).userId;
  if (typeof userId !== 'string' || userId.length === 0) return undefined;

  const role = (payload as { role?: unknown }).role;
  return {
    ...(payload as Record<string, unknown>),
    userId,
    ...(typeof role === 'string' ? { role } : {}),
  };
};

export const authenticate: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) throw new AuthenticationError('No authentication token provided');

    const payload = verifyAccessToken(token);
    const user = toRequestUser(payload);
    if (!user) throw new AuthenticationError('Invalid authentication token');

    req.user = user;
    next();
  } catch (error) {
    next(new AuthenticationError(error instanceof Error ? error.message : 'Authentication failed'));
  }
};

export const optionalAuthenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);
    const user = toRequestUser(payload);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

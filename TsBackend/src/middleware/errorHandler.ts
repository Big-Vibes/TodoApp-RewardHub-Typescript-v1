import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import { config } from '../config/env.js';
import { AppError } from '../utils/helpers.js';

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError, res: Response): void => {
  switch (error.code) {
    case 'P2002':
      res.status(409).json({
        success: false,
        message: `A record with this ${(error.meta?.target as string[] | undefined)?.join(', ')} already exists`,
      });
      break;
    case 'P2025':
      res.status(404).json({ success: false, message: 'Record not found' });
      break;
    case 'P2003':
      res.status(400).json({ success: false, message: 'Invalid reference to related record' });
      break;
    case 'P2016':
      res.status(404).json({ success: false, message: 'Record not found' });
      break;
    default:
      res.status(400).json({
        success: false,
        message: 'Database operation failed',
        ...(config.isDevelopment && { code: error.code, meta: error.meta }),
      });
  }
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (config.isDevelopment) console.error('Error:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(config.isDevelopment && { stack: error.stack }),
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Invalid data provided',
      ...(config.isDevelopment && { error: error.message }),
    });
    return;
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ success: false, message: 'Invalid authentication token' });
      return;
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Authentication token expired' });
      return;
    }
  }

  res.status(500).json({
    success: false,
    message:
      config.isProduction ? 'Internal server error' : ((error as { message?: string }).message ?? 'Internal server error'),
    ...(config.isDevelopment && { stack: (error as { stack?: string }).stack }),
  });
};

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const asyncHandler = <TArgs extends unknown[]>(
  fn: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>
) => {
  return ((req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }) satisfies RequestHandler;
};

import type { Request } from 'express';
import { Role } from '@prisma/client';

// JWT PAYLOAD TYPES

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
}


// AUTHENTICATED REQUEST


export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}


// API RESPONSE TYPES


export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


// USER TYPES


export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  totalPoints: number;
  currentLevel: number;
  isActive: boolean;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  email: string;
  username: string | null;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
}


// TASK TYPES


export interface TaskWithStatus {
  id: string;
  title: string;
  description: string | null;
  pointValue: number;
  isCompleted: boolean;
  completedAt: Date | null;
  cooldownUntil: Date | null;
  canComplete: boolean;
}


// STREAK TYPES


export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  weekStartDate: Date;
  weekEndDate: Date;
  lastCompletedAt: Date | null;
  daysCompleted: number;
  daysRemaining: number;
}


// PROGRESS TYPES


export interface Milestone {
  level: number;
  name: string;
  requiredPoints: number;
  color: string;
}

export interface ProgressInfo {
  current: Milestone;
  next: Milestone | null;
  progress: number;
  pointsToNext: number;
  isMaxLevel: boolean;
}


// DASHBOARD TYPES


export interface DashboardStats {
  user: UserProfile;
  tasks: {
    total: number;
    completed: number;
    remaining: number;
    completionRate: number;
  };
  streak: StreakInfo;
  progress: ProgressInfo;
  recentActivity: Array<{
    id: string;
    action: string;
    pointsAwarded: number;
    timestamp: Date;
  }>;
}


// ERROR TYPES


export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(409, message);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message);
  }
}
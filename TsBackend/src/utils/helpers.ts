import { differenceInDays, endOfWeek, startOfDay, startOfWeek } from 'date-fns';

// ============================================
// DATE UTILITIES
// ============================================

export type WeekBoundaries = Readonly<{
  start: Date;
  end: Date;
}>;

export const getWeekBoundaries = (date: Date = new Date()): WeekBoundaries => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }), // Sunday
  };
};

export const isToday = (date: Date): boolean => {
  const today = startOfDay(new Date());
  const targetDay = startOfDay(date);
  return today.getTime() === targetDay.getTime();
};

export const daysSince = (date: Date): number => {
  return differenceInDays(new Date(), date);
};

// ============================================
// MILESTONE SYSTEM
// ============================================

export type Milestone = Readonly<{
  level: number;
  name: string;
  requiredPoints: number;
  color: string;
}>;

export const MILESTONES: readonly Milestone[] = [
  { level: 1, name: 'Bronze Beginner', requiredPoints: 0, color: '#CD7F32' },
  { level: 2, name: 'Silver Starter', requiredPoints: 100, color: '#C0C0C0' },
  { level: 3, name: 'Gold Achiever', requiredPoints: 300, color: '#FFD700' },
  { level: 4, name: 'Platinum Pro', requiredPoints: 600, color: '#E5E4E2' },
  { level: 5, name: 'Diamond Elite', requiredPoints: 1000, color: '#B9F2FF' },
  { level: 6, name: 'Master Champion', requiredPoints: 1500, color: '#4B0082' },
  { level: 7, name: 'Legendary Hero', requiredPoints: 2500, color: '#FF6347' },
];

const DEFAULT_MILESTONE = MILESTONES[0]!;

export type ProgressResult = Readonly<{
  current: Milestone;
  next: Milestone | null;
  progress: number;
  pointsToNext: number;
  isMaxLevel: boolean;
}>;

export const calculateProgress = (totalPoints: number): ProgressResult => {
  const currentMilestone =
    [...MILESTONES].reverse().find((m) => totalPoints >= m.requiredPoints) ?? DEFAULT_MILESTONE;

  const nextMilestone = MILESTONES.find((m) => m.requiredPoints > totalPoints) ?? null;

  if (!nextMilestone) {
    return {
      current: currentMilestone,
      next: null,
      progress: 100,
      pointsToNext: 0,
      isMaxLevel: true,
    };
  }

  const pointsIntoLevel = totalPoints - currentMilestone.requiredPoints;
  const pointsNeeded = nextMilestone.requiredPoints - currentMilestone.requiredPoints;
  const progress = Math.round((pointsIntoLevel / pointsNeeded) * 100);

  return {
    current: currentMilestone,
    next: nextMilestone,
    progress,
    pointsToNext: nextMilestone.requiredPoints - totalPoints,
    isMaxLevel: false,
  };
};

export const getMilestoneByLevel = (level: number): Milestone | undefined => {
  return MILESTONES.find((m) => m.level === level);
};

// ============================================
// RESPONSE HELPERS
// ============================================

export type SuccessResponse<TData> = Readonly<{
  success: true;
  data: TData;
  message?: string;
}>;

export const successResponse = <TData>(data: TData, message?: string): SuccessResponse<TData> => {
  return {
    success: true,
    data,
    ...(message !== undefined ? { message } : {}),
  };
};

export type ErrorResponse = Readonly<{
  success: false;
  message: string;
  error: unknown;
}>;

export const errorResponse = (message: string, error?: unknown): ErrorResponse => {
  return {
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
  };
};

export type PaginatedResponse<TData> = Readonly<{
  success: true;
  data: TData;
  pagination: Readonly<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  }>;
}>;

export const paginatedResponse = <TData>(
  data: TData,
  page: number,
  limit: number,
  total: number
): PaginatedResponse<TData> => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

// ============================================
// STRING UTILITIES
// ============================================

export const generateUsername = (email: string): string => {
  const username = email.split('@')[0] ?? '';
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${username}${randomSuffix}`;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

// ============================================
// ARRAY UTILITIES
// ============================================

export const chunk = <T>(array: readonly T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

export const shuffle = <T>(array: readonly T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// TIME FORMATTING
// ============================================

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const getCooldownRemaining = (cooldownUntil?: Date | null): number => {
  if (!cooldownUntil) return 0;
  const remaining = cooldownUntil.getTime() - Date.now();
  return Math.max(0, remaining);
};

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
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

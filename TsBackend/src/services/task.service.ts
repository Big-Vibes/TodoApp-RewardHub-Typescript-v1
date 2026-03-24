import type { Task, TaskHistoryEntry, TaskStats } from '../types/service.js';
import { prisma } from '../config/database.js';
import { calculateProgress, ConflictError, NotFoundError, ValidationError } from '../utils/helpers.js';
import { addMinutes, startOfDay } from 'date-fns';
import type { Prisma } from '@prisma/client';

const toApiTask = (task: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  pointValue: number;
  isCompleted: boolean;
  completedAt: Date | null;
  cooldownUntil: Date | null;
  completionCount: number;
  createdAt: Date;
  updatedAt: Date;
}): Task => {
  const now = new Date();
  const onCooldown = task.cooldownUntil !== null && task.cooldownUntil > now;
  const canComplete = !task.isCompleted && !onCooldown;

  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    pointValue: task.pointValue,
    isCompleted: task.isCompleted,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    cooldownUntil: task.cooldownUntil ? task.cooldownUntil.toISOString() : null,
    completionCount: task.completionCount,
    canComplete,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  } satisfies Task;
};

export class TaskService {
  static async getUserTasks(_userId: string): Promise<Task[]> {
    if (!_userId) throw new ValidationError('User ID is required');

    const tasks = await prisma.task.findMany({
      where: { userId: _userId },
      orderBy: { createdAt: 'asc' },
      take: 5,
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        pointValue: true,
        isCompleted: true,
        completedAt: true,
        cooldownUntil: true,
        completionCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return tasks.map(toApiTask);
  }

  static async getTaskById(_taskId: string, _userId: string): Promise<Task> {
    if (!_userId) throw new ValidationError('User ID is required');
    if (!_taskId) throw new ValidationError('Task ID is required');

    const task = await prisma.task.findFirst({
      where: { id: _taskId, userId: _userId },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        pointValue: true,
        isCompleted: true,
        completedAt: true,
        cooldownUntil: true,
        completionCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!task) throw new NotFoundError('Task not found');
    return toApiTask(task);
  }

  static async completeTask(
    _taskId: string,
    _userId: string
  ): Promise<{ task: Task; pointsAwarded: number }> {
    if (!_userId) throw new ValidationError('User ID is required');
    if (!_taskId) throw new ValidationError('Task ID is required');

    const now = new Date();
    const cooldownUntil = addMinutes(now, 5);

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id: _taskId, userId: _userId },
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          pointValue: true,
          isCompleted: true,
          completedAt: true,
          cooldownUntil: true,
          completionCount: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!task) throw new NotFoundError('Task not found');

      if (task.cooldownUntil && task.cooldownUntil > now) {
        throw new ConflictError('Task is on cooldown');
      }

      const user = await tx.user.findUnique({
        where: { id: _userId },
        select: { id: true, totalPoints: true },
      });
      if (!user) throw new NotFoundError('User not found');

      const pointsAwarded = 20;
      const newTotalPoints = user.totalPoints + pointsAwarded;
      const progress = calculateProgress(newTotalPoints);

      const updatedTask = await tx.task.update({
        where: { id: task.id },
        data: {
          isCompleted: false,
          completedAt: now,
          cooldownUntil,
          completionCount: { increment: 1 },
        },
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          pointValue: true,
          isCompleted: true,
          completedAt: true,
          cooldownUntil: true,
          completionCount: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          totalPoints: newTotalPoints,
          currentLevel: progress.current.level,
        },
        select: { id: true },
      });

      const metadata: Prisma.InputJsonValue = { taskId: task.id, title: task.title };
      await tx.taskHistory.create({
        data: {
          userId: user.id,
          taskId: task.id,
          action: 'COMPLETED',
          pointsAwarded,
          metadata,
          timestamp: now,
        },
        select: { id: true },
      });

      return { updatedTask, pointsAwarded };
    });

    return { task: toApiTask(result.updatedTask), pointsAwarded: result.pointsAwarded };
  }

  static async getTaskStats(_userId: string): Promise<TaskStats> {
    if (!_userId) throw new ValidationError('User ID is required');

    const [total, completed] = await Promise.all([
      prisma.task.count({ where: { userId: _userId } }),
      prisma.task.count({ where: { userId: _userId, isCompleted: true } }),
    ]);

    const remaining = Math.max(0, total - completed);
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, remaining, completionRate } satisfies TaskStats;
  }

  static async getTaskHistory(_userId: string, _limit: number): Promise<TaskHistoryEntry[]> {
    if (!_userId) throw new ValidationError('User ID is required');
    const limit = Number.isFinite(_limit) && _limit > 0 ? Math.floor(_limit) : 10;

    const history = await prisma.taskHistory.findMany({
      where: { userId: _userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        pointsAwarded: true,
        timestamp: true,
      },
    });

    return history.map((h) => ({
      id: h.id,
      action: h.action,
      pointsAwarded: h.pointsAwarded,
      timestamp: h.timestamp.toISOString(),
    })) satisfies TaskHistoryEntry[];
  }

  static async getDailyPointsEarned(_userId: string): Promise<number> {
    if (!_userId) throw new ValidationError('User ID is required');

    const from = startOfDay(new Date());
    const result = await prisma.taskHistory.aggregate({
      where: { userId: _userId, action: 'COMPLETED', timestamp: { gte: from } },
      _sum: { pointsAwarded: true },
    });

    return result._sum.pointsAwarded ?? 0;
  }

  static async resetDailyTasks(): Promise<number> {
    const now = new Date();
    const todayStart = startOfDay(now);

    const result = await prisma.task.updateMany({
      where: {
        lastResetAt: { lt: todayStart },
      },
      data: {
        isCompleted: false,
        completedAt: null,
        cooldownUntil: null,
        lastResetAt: now,
      },
    });

    return result.count;
  }
}

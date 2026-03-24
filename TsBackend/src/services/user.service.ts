import type { LeaderboardEntry, LeaderboardResult, LeaderboardStats, UserDashboard, UserProfile } from '../types/service.js';
import { prisma } from '../config/database.js';
import { calculateProgress, NotFoundError, ValidationError } from '../utils/helpers.js';
import { startOfWeek, endOfWeek } from 'date-fns';

export class UserService {
  static async getDashboardStats(_userId: string): Promise<UserDashboard> {
    if (!_userId) throw new ValidationError('User ID is required');

    const user = await prisma.user.findUnique({
      where: { id: _userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');

    const [tasks, streak] = await Promise.all([
      prisma.task.findMany({
        where: { userId: _userId },
        select: { id: true, isCompleted: true },
      }),
      prisma.streak.findUnique({
        where: { userId: _userId },
        select: {
          currentStreak: true,
          longestStreak: true,
          weekStartDate: true,
          weekEndDate: true,
          lastCompletedAt: true,
        },
      }),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const remainingTasks = Math.max(0, totalTasks - completedTasks);
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const now = new Date();
    const weekStart = streak?.weekStartDate ?? startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = streak?.weekEndDate ?? endOfWeek(now, { weekStartsOn: 1 });

    const weeklyHistory = await prisma.taskHistory.findMany({
      where: {
        userId: _userId,
        action: 'COMPLETED',
        timestamp: { gte: weekStart, lte: weekEnd },
      },
      select: { timestamp: true },
    });

    const dayKey = (d: Date): string => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const uniqueDays = new Set(weeklyHistory.map((h) => dayKey(h.timestamp)));
    const daysCompleted = Math.min(7, uniqueDays.size);
    const daysRemaining = Math.max(0, 7 - daysCompleted);

    const recentActivity = await prisma.taskHistory.findMany({
      where: { userId: _userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        pointsAwarded: true,
        timestamp: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        remaining: remainingTasks,
        completionRate,
      },
      streak: {
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        weekStartDate: weekStart.toISOString(),
        weekEndDate: weekEnd.toISOString(),
        lastCompletedAt: streak?.lastCompletedAt ? streak.lastCompletedAt.toISOString() : null,
        daysCompleted,
        daysRemaining,
      },
      progress: calculateProgress(user.totalPoints),
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        pointsAwarded: a.pointsAwarded,
        timestamp: a.timestamp.toISOString(),
      })),
    } satisfies UserDashboard;
  }

  static async getUserProfile(_userId: string): Promise<UserProfile> {
    if (!_userId) throw new ValidationError('User ID is required');

    const user = await prisma.user.findUnique({
      where: { id: _userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      totalPoints: user.totalPoints,
      currentLevel: user.currentLevel,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    } satisfies UserProfile;
  }

  static async getUserRank(_userId: string): Promise<number> {
    if (!_userId) throw new ValidationError('User ID is required');

    const user = await prisma.user.findUnique({
      where: { id: _userId },
      select: { totalPoints: true, createdAt: true, isActive: true },
    });
    if (!user) throw new NotFoundError('User not found');
    if (!user.isActive) throw new NotFoundError('User not found');

    const ahead = await prisma.user.count({
      where: {
        isActive: true,
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          { totalPoints: user.totalPoints, createdAt: { lt: user.createdAt } },
        ],
      },
    });

    return ahead + 1;
  }
}

export class LeaderboardService {
  static async getLeaderboard(_page: number, _limit: number): Promise<LeaderboardResult> {
    const page = Number.isFinite(_page) && _page > 0 ? Math.floor(_page) : 1;
    const limit = Number.isFinite(_limit) && _limit > 0 ? Math.floor(_limit) : 20;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.findMany({
        where: { isActive: true },
        orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          totalPoints: true,
          currentLevel: true,
          streak: { select: { currentStreak: true } },
        },
      }),
    ]);

    const leaderboard: LeaderboardEntry[] = users.map((u, idx) => ({
      rank: skip + idx + 1,
      id: u.id,
      email: u.email,
      username: u.username,
      totalPoints: u.totalPoints,
      currentLevel: u.currentLevel,
      currentStreak: u.streak?.currentStreak ?? 0,
    }));

    return { leaderboard, total };
  }

  static async getTopPerformers(_limit: number): Promise<LeaderboardEntry[]> {
    const limit = Number.isFinite(_limit) && _limit > 0 ? Math.floor(_limit) : 10;

    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        totalPoints: true,
        currentLevel: true,
        streak: { select: { currentStreak: true } },
      },
    });

    return users.map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      email: u.email,
      username: u.username,
      totalPoints: u.totalPoints,
      currentLevel: u.currentLevel,
      currentStreak: u.streak?.currentStreak ?? 0,
    })) satisfies LeaderboardEntry[];
  }

  static async getLeaderboardStats(): Promise<LeaderboardStats> {
    const [totalUsers, totalPointsAgg, topUser, topStreak] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.aggregate({ where: { isActive: true }, _sum: { totalPoints: true }, _avg: { totalPoints: true } }),
      prisma.user.findFirst({
        where: { isActive: true },
        orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
        select: { id: true, username: true, email: true, totalPoints: true, currentLevel: true },
      }),
      prisma.streak.findFirst({
        orderBy: [{ currentStreak: 'desc' }],
        select: { userId: true, currentStreak: true, longestStreak: true },
      }),
    ]);

    return {
      totalUsers,
      totalPoints: totalPointsAgg._sum.totalPoints ?? 0,
      averagePoints: Math.round(totalPointsAgg._avg.totalPoints ?? 0),
      topUser,
      topStreak,
    } satisfies LeaderboardStats;
  }
}

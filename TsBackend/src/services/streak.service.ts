import type { Streak } from '../types/service.js';
import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { differenceInCalendarDays, endOfWeek, isSameDay, startOfWeek } from 'date-fns';

export class StreakService {
  static async updateStreak(_userId: string): Promise<Streak> {
    if (!_userId) throw new ValidationError('User ID is required');

    const userExists = await prisma.user.findUnique({
      where: { id: _userId },
      select: { id: true, isActive: true },
    });
    if (!userExists || !userExists.isActive) throw new NotFoundError('User not found');

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const existing = await prisma.streak.findUnique({
      where: { userId: _userId },
      select: { id: true, currentStreak: true, longestStreak: true, lastCompletedAt: true },
    });

    if (!existing) {
      const created = await prisma.streak.create({
        data: {
          userId: _userId,
          currentStreak: 1,
          longestStreak: 1,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          lastCompletedAt: now,
        },
        select: { currentStreak: true, longestStreak: true },
      });
      return created satisfies Streak;
    }

    let newCurrent = existing.currentStreak;
    if (!existing.lastCompletedAt) {
      newCurrent = 1;
    } else if (isSameDay(existing.lastCompletedAt, now)) {
      newCurrent = existing.currentStreak;
    } else {
      const diff = differenceInCalendarDays(now, existing.lastCompletedAt);
      newCurrent = diff === 1 ? existing.currentStreak + 1 : 1;
    }

    const newLongest = Math.max(existing.longestStreak, newCurrent);

    const updated = await prisma.streak.update({
      where: { id: existing.id },
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        lastCompletedAt: now,
      },
      select: { currentStreak: true, longestStreak: true },
    });

    return updated satisfies Streak;
  }

  static async resetWeeklyStreaks(): Promise<number> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const result = await prisma.streak.updateMany({
      data: {
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
      },
    });

    return result.count;
  }
}

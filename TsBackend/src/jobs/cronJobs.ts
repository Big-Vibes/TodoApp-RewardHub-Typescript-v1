import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { config } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';
import { StreakService } from '../services/streak.service.js';
import { TaskService } from '../services/task.service.js';

export class CronJobManager {
  private static jobs: ScheduledTask[] = [];
  

  static startAll(): void {
    console.log('Starting cron jobs...');

    this.startDailyTaskReset();
    this.startWeeklyStreakReset();
    this.startTokenCleanup();

    console.log('All cron jobs started successfully');
  }

  static stopAll(): void {
    console.log('Stopping all cron jobs...');
    for (const job of this.jobs) job.stop();
    this.jobs = [];
    console.log('All cron jobs stopped');
  }

  static startDailyTaskReset(): void {
    const job = cron.schedule(
      config.cron.dailyResetSchedule,
      async () => {
        try {
          console.log('Running daily task reset...');
          const resetCount = await TaskService.resetDailyTasks();
          console.log(`Daily task reset complete: ${resetCount} tasks reset`);
        } catch (error) {
          console.error('Error in daily task reset:', error);
        }
      },
      { timezone: config.cron.timezone }
    );

    this.jobs.push(job);
    console.log(
      `Daily task reset scheduled: ${config.cron.dailyResetSchedule} (${config.cron.timezone})`
    );
  }

  static startWeeklyStreakReset(): void {
    const job = cron.schedule(
      '0 0 * * 1',
      async () => {
        try {
          console.log('Running weekly streak reset...');
          const resetCount = await StreakService.resetWeeklyStreaks();
          console.log(`Weekly streak reset complete: ${resetCount} streaks reset`);
        } catch (error) {
          console.error('Error in weekly streak reset:', error);
        }
      },
      { timezone: config.cron.timezone }
    );

    this.jobs.push(job);
    console.log(`Weekly streak reset scheduled: Every Monday at midnight (${config.cron.timezone})`);
  }

  static startTokenCleanup(): void {
    const job = cron.schedule(
      '0 2 * * *',
      async () => {
        try {
          console.log('Cleaning up expired tokens...');
          const deletedCount = await AuthService.cleanupExpiredTokens();
          console.log(`Token cleanup complete: ${deletedCount} tokens removed`);
        } catch (error) {
          console.error('Error in token cleanup:', error);
        }
      },
      { timezone: config.cron.timezone }
    );

    this.jobs.push(job);
    console.log(`Token cleanup scheduled: Daily at 2 AM (${config.cron.timezone})`);
  }

  static async triggerDailyReset(): Promise<void> {
    console.log('Manually triggering daily task reset...');
    const resetCount = await TaskService.resetDailyTasks();
    console.log(`Manual reset complete: ${resetCount} tasks reset`);
  }

  static async triggerWeeklyReset(): Promise<void> {
    console.log('Manually triggering weekly streak reset...');
    const resetCount = await StreakService.resetWeeklyStreaks();
    console.log(`Manual reset complete: ${resetCount} streaks reset`);
  }

  static async triggerTokenCleanup(): Promise<void> {
    console.log('Manually triggering token cleanup...');
    const deletedCount = await AuthService.cleanupExpiredTokens();
    console.log(`Manual cleanup complete: ${deletedCount} tokens removed`);
  }
}


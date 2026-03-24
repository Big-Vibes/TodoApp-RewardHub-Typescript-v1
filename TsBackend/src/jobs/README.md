# `src/jobs/` (The Alarm Clock)

This folder runs things *later*, on a schedule, even if nobody is clicking buttons.

## Files

- `cronJobs.ts` — starts/stops scheduled jobs with `node-cron`:
  - Daily task reset (schedule from `config.cron.dailyResetSchedule`)
  - Weekly streak “week window” reset (every Monday)
  - Refresh token cleanup (daily at 2 AM)

## Who starts this?

- `server.ts` calls `CronJobManager.startAll()` when the API boots, and `stopAll()` during graceful shutdown.


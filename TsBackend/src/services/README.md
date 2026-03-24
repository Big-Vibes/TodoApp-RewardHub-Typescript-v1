# `src/services/` (The Workers)

Services do the real work: business logic + Prisma database queries. Controllers should mostly just call services.

## Files

- `auth.service.ts` — register/login/refresh/logout + token cleanup:
  - Validates inputs with Zod schemas (`utils/validation.ts`)
  - Hashes passwords with `utils/password.ts` (`bcryptjs`)
  - Creates/verifies tokens with `utils/jwt.ts` (`jsonwebtoken`)
  - Stores refresh tokens in the DB (rotation + revoke)
  - Creates default dashboard tasks for new users
- `task.service.ts` — task data + “complete task” flow:
  - Uses Prisma transactions to update task, award points, write task history
  - Uses `date-fns` for cooldown + day/week boundaries
  - Has daily reset logic used by cron jobs
- `streak.service.ts` — streak updates + weekly window reset:
  - Updates current/longest streak
  - Resets weekly window dates
- `user.service.ts` — dashboard/profile/rank + leaderboard:
  - Builds the dashboard payload (tasks, streak, progress, recent activity)
  - Builds leaderboard pages, top performers, and aggregate stats

## Who calls services?

- Mostly `controllers/*.ts`
- Also `jobs/cronJobs.ts` (scheduled “worker” calls)


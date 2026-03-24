# `src/config/` (Settings Drawer)

This folder holds the “settings” the app needs to run, plus the database connection.

## Files

- `env.ts` — reads `.env`, checks it with Zod, and exports one safe `config` object (port, DB URL, JWT secrets, CORS, rate limits, cron settings).
- `database.ts` — creates the Prisma client (using the Postgres adapter + `pg` Pool) and exports:
  - `prisma` — the database client everyone uses
  - `disconnectPrisma()` — closes Prisma + the DB pool during shutdown

## Who uses this?

- `server.ts` reads `config` for port, environment, CORS, logging, and cron schedule settings.
- `services/*.ts` import `prisma` to read/write data in Postgres.


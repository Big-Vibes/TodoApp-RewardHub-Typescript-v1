# TodoApp-RewardHub-Typescript-v1

This folder is the backend’s “brain and body”. When the frontend says “please do something”, the code in here listens, thinks, talks to the database, and answers back.

## What’s inside `src/`

- `server.ts` — starts the Express app, plugs in middleware, mounts routes, starts cron jobs, and shuts down gracefully.
- Folders (each has its own `README.md`): `config/`, `routes/`, `middleware/`, `controllers/`, `services/`, `utils/`, `types/`, `jobs/`.

## The big story (how a request walks through the app)

1. `server.ts` opens the door (starts Express) and adds safety gear (security, CORS, rate limits).
2. `routes/` chooses *which* “page” (endpoint) you want.
3. `middleware/` are the “helpers at the door” (check token, validate body, limit spam).
4. `controllers/` are the “teachers” (they read the request and decide what to do).
5. `services/` are the “workers” (real business logic + Prisma database calls).
6. `utils/` are “toolboxes” (JWT, passwords, validation, helper functions).
7. `config/` is the “settings drawer” (env vars + database client).
8. If anything breaks, `middleware/errorHandler.ts` cleans it up and returns a nice error.

## Where to read next

- `config/README.md` — settings + database connection
- `routes/README.md` — all URLs and what they do
- `middleware/README.md` — authentication, validation, rate limiting, error handling
- `controllers/README.md` — request handlers (thin layer)
- `services/README.md` — business logic + Prisma queries
- `utils/README.md` — helper functions (JWT, passwords, Zod schemas, etc.)
- `types/README.md` — shared TypeScript types
- `jobs/README.md` — cron jobs (scheduled background work)

## Dependencies (explained like you’re 5)

Think of dependencies like toys we borrow so we don’t have to build everything from scratch:

- `express` — the “door + hallway” where web requests come in and responses go out.
- `helmet` — the “helmet” for safer HTTP headers.
- `cors` — the “bouncer” that decides which website is allowed to talk to the API.
- `cookie-parser` — reads cookies so `/auth/refresh` can find the `refreshToken`.
- `morgan` — the “diary” that writes down requests (logs) while you develop.
- `dotenv` — reads `.env` so secrets/settings become `process.env.*`.
- `zod` — the “teacher” that checks if data looks correct (env validation + request body validation).
- `@prisma/client` + `prisma` — the “robot hands” for talking to the database with nice TypeScript types.
- `pg` + `@prisma/adapter-pg` — the “Postgres cable” Prisma uses to connect to the DB.
- `jsonwebtoken` — makes and checks “ID stickers” (JWT access/refresh tokens).
- `bcryptjs` — locks/unlocks passwords (hash + compare).
- `express-rate-limit` — stops “button mashing” (too many requests).
- `node-cron` — an “alarm clock” that runs jobs on a schedule.
- `date-fns` — small “calendar ruler” helpers for dates (streaks, weeks, cooldowns).

Notes:
- This project uses ESM (`"type": "module"`), so many imports end in `.js` even though the files are `.ts`.

## “Where do I see these dependencies in code?”

- `express` → `server.ts`, `routes/*.ts`, `middleware/*.ts` (Request/Response types)
- `helmet`, `cors`, `cookie-parser`, `morgan` → `server.ts` (global middleware)
- `dotenv`, `zod` → `config/env.ts` (loads + validates env vars), `utils/validation.ts` (validates request bodies)
- `@prisma/client`, `pg`, `@prisma/adapter-pg` → `config/database.ts` + `services/*.ts`
- `jsonwebtoken` → `utils/jwt.ts` + `middleware/authenticate.ts`
- `bcryptjs` → `utils/password.ts` + `services/auth.service.ts`
- `express-rate-limit` → `middleware/rateLimiter.ts`
- `node-cron` → `jobs/cronJobs.ts`
- `date-fns` → `utils/helpers.ts`, `services/*.ts`

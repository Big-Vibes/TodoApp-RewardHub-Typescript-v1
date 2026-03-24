# RewardHub API (TsBackend)

TypeScript + Express + Prisma (Postgres) backend for **RewardHub / TodoGamify** - a gamified to-do app where users complete tasks to earn points, maintain streaks, and climb a leaderboard.

## Objective & Aim

- Turn everyday tasks into a game loop (points, streaks, progress).
- Provide a clean REST API for authentication, task tracking, dashboards, and leaderboards.
- Keep the backend easy to run locally so a recruiter (or a beginner) can set it up quickly.

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Server: Express
- Database: PostgreSQL + Prisma ORM
- Auth: JWT access token + refresh token (httpOnly cookie)
- Validation: Zod
- Security/ops: Helmet, CORS, rate limiting, Morgan logging, cookie-parser
- Jobs: node-cron (daily resets / cleanup)

## Project Structure (high level)

```text
TsBackend/
  prisma/              # schema, migrations, seed
  src/
    config/            # env + DB setup
    controllers/       # request handlers
    middleware/        # auth, validation, error handling, rate limiter
    routes/            # express routers (mounted under /api)
    services/          # business logic (tasks, streaks, users, auth)
    utils/             # helpers (jwt, password hashing, validation)
    server.ts          # app + middleware + server startup
  dist/                # build output (generated)
```

## Quick Start (novice-friendly)

### 1) Prerequisites

- Node.js (LTS recommended)
- PostgreSQL database (local Postgres or a hosted one like Neon)

### 2) Install dependencies

From the `TsBackend/` folder:

```bash
npm install
```

### 3) Create your environment file

Copy the example env file and edit values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Minimum you must set in `.env`:

- `DATABASE_URL` (Postgres connection string)
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (long random strings)
- `FRONTEND_URL` (usually `http://localhost:5173` for the Vite frontend)

### 4) Prisma setup (database)

```bash
npm run prisma:generate
npm run prisma:migrate
```

Optional seed:

```bash
npm run prisma:seed
```

### 5) Start the API

```bash
npm run dev
```

By default, the server runs on `http://localhost:3000` and the health check is:

- `GET http://localhost:3000/api/health`

## How the Frontend Connects

The React frontend uses Axios with a base URL that points at this backend:

- Frontend API client: `frontend/Rewardhub/src/services/api.ts`
  - `VITE_API_URL` (optional) OR defaults to `http://localhost:3000/api`

Recommended local setup (Vite proxy):

1. Set frontend env `VITE_API_URL=/api` (create `frontend/Rewardhub/.env` if you don’t have one).
2. Keep Vite proxy enabled in `frontend/Rewardhub/vite.config.ts` (it proxies `/api` → `http://localhost:3000`).

This avoids CORS headaches because the browser calls the Vite dev server, which forwards API requests to the backend.

## Auth Model (what to expect)

- Access token: returned in JSON; send it on requests as `Authorization: Bearer <token>`.
- Refresh token: stored as an `httpOnly` cookie named `refreshToken`.
- Refresh rotation: `POST /api/auth/refresh` rotates the refresh cookie and returns a new access token.

## API Response Shapes

- Success: `{ success: true, data: <payload>, message?: string }`
- Pagination: `{ success: true, data: <items>, pagination: { page, limit, total, totalPages, hasMore } }`
- Error: `{ success: false, message: string }` (may include extra debug details in development)

## Routes (REST API)

All endpoints are under the `/api` prefix.

### Health

- `GET /api/health` - liveness check

### Auth

- `POST /api/auth/register` - register and set refresh cookie
- `POST /api/auth/login` - login and set refresh cookie
- `POST /api/auth/refresh` - rotate refresh cookie, return new access token
- `POST /api/auth/logout` - clears refresh cookie (requires access token)
- `GET /api/auth/me` - current user (requires access token)

### Tasks (requires auth)

- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `POST /api/tasks/:taskId/complete`
- `GET /api/tasks/stats`
- `GET /api/tasks/history?limit=10`
- `GET /api/tasks/daily-points`

Note: some task mutation endpoints may be intentionally disabled (returning `403`) depending on product rules.

### Users (requires auth)

- `GET /api/users/dashboard`
- `GET /api/users/profile`
- `GET /api/users/rank`

### Leaderboard

- `GET /api/leaderboard?page=1&limit=20`
- `GET /api/leaderboard/top?limit=10`
- `GET /api/leaderboard/stats`

## API Testing in VS Code (Thunder Client)

1. Install the VS Code extension **Thunder Client**.
2. Create a Thunder environment, e.g.:
   - `BASE_URL` = `http://localhost:3000/api`
   - `ACCESS_TOKEN` = (leave empty initially)
3. Create a request: `POST {{BASE_URL}}/auth/login`
   - Body (JSON): `{ "email": "...", "password": "..." }`
   - After login, copy the returned access token into `ACCESS_TOKEN`.
4. For protected routes (tasks/users), add header:
   - `Authorization: Bearer {{ACCESS_TOKEN}}`
5. Refresh flow:
   - Call `POST {{BASE_URL}}/auth/refresh`
   - Make sure Thunder Client cookie storage is enabled so it can send the `refreshToken` cookie automatically.

## License

MIT - see `LICENSE`.

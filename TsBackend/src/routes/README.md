# `src/routes/` (The Map Of URLs)

Routes are the “map”. They decide which controller function runs when someone visits a URL.

## Files

- `route.ts` — the big router that mounts `index.ts` under `/api`.
- `index.ts` — “API home” routes:
  - `GET /api/health`
  - mounts:
    - `/api/auth` → `auth.routes.ts`
    - `/api/tasks` → `task.routes.ts`
    - `/api/users` → `user.routes.ts` (userRouter)
    - `/api/leaderboard` → `user.routes.ts` (leaderboardRouter)
- `auth.routes.ts` — auth endpoints (register/login/refresh/logout/me) with validation + rate limiting.
- `task.routes.ts` — task endpoints; requires authentication for everything in this router.
- `user.routes.ts` — user endpoints (needs auth) + leaderboard endpoints (some are public).

## Toddler version of “routing”

If the API is a house:
- Routes are the “signs on doors” that say “kitchen”, “bedroom”, “bathroom”.
- Controllers are the people inside the rooms who help you.


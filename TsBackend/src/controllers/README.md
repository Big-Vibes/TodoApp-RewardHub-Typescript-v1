# `src/controllers/` (The “Teachers”)

Controllers are small “teachers”: they read the request, call the right service, and send the answer back.

## Files

- `auth.controller.ts` — register/login/refresh/logout/me endpoints; sets/clears the `refreshToken` cookie and returns `accessToken` in JSON.
- `task.controller.ts` — task endpoints (list, stats, history, daily points, complete task). Some endpoints intentionally return **403** (custom create/edit/delete disabled).
- `user.controller.ts` — user dashboard/profile/rank + leaderboard endpoints (calls `UserService` / `LeaderboardService`).
- `authRegControler.ts` — a stub/placeholder “register” handler that currently returns **501 Not implemented**.

## Pattern

Controllers should stay thin:
- “What did the user ask for?”
- “Call service to do the work”
- “Return `successResponse(...)`”


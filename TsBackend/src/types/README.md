# `src/types/` (Type Labels)

Types are “labels” that help TypeScript understand what shape data should have.

## Files

- `express.d.ts` — adds extra fields to Express `Request`:
  - `req.user` (from JWT)
  - `req.cookies` (used by auth refresh)
- `service.ts` — the main “API shapes” used by services/controllers (users, tasks, streaks, leaderboard, tokens).
- `index.ts` — a legacy/alternate type file (not currently imported in `src/`).
- `vendor.d.ts` — tiny TypeScript type shims for packages that are imported as ESM in this project (`cookie-parser`, `cors`, `morgan`).


# `src/utils/` (Toolbox)

This folder is a toolbox: small helpers that many parts of the app reuse.

## Files

- `helpers.ts` — lots of helper things:
  - date helpers (week boundaries, “is today”, etc.)
  - milestone/level math (`calculateProgress`)
  - response helpers (`successResponse`, `paginatedResponse`)
  - custom error classes (`AppError`, `ValidationError`, etc.)
- `jwt.ts` — makes and checks JWT tokens (access + refresh), and reads token expiration.
- `password.ts` — hashes and compares passwords with `bcryptjs`, plus a simple password-strength checker.
- `validation.ts` — Zod schemas for request bodies/queries (auth, tasks, users, admin).


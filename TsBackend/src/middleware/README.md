# `src/middleware/` (Helpers At The Door)

Middleware are “helpers” that run before your controller. They can stop bad requests early and keep things safe.

## Files

- `authenticate.ts` — checks `Authorization: Bearer <token>`, verifies the JWT, and puts `req.user` on the request.
- `authorize.ts` — role checks (like “admin only”) and ownership checks (only touch your own stuff).
- `rateLimiter.ts` — uses `express-rate-limit` to slow down spam:
  - `apiLimiter` (general)
  - `authLimiter` (login/register)
  - `taskCompletionLimiter`, `createTaskLimiter`
- `validate.ts` — uses Zod to validate `req.body`, `req.query`, or `req.params` and throws a friendly `ValidationError`.
- `errorHandler.ts` — the “cleanup crew”:
  - `asyncHandler()` catches async errors so you don’t need `try/catch` everywhere
  - `notFoundHandler` returns a 404 for unknown routes
  - `errorHandler` converts Prisma/JWT/custom errors into consistent JSON responses

## Where middleware is used

- `routes/*.ts` wires middleware together: `rateLimiter` → `validate` → `authenticate` → controller.
- `server.ts` adds global middleware like `helmet`, `cors`, `cookie-parser`, and the error handlers.


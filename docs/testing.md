# Testing

## Test setup
- **Playwright** for e2e (main user flow): `npx playwright test`
- Tests live in `tests/e2e/`.
- Seed demo accounts first: `npx prisma db seed`.

## What must be covered
- Main user flow: login → open WOs → create → assign → technician start → complete.
- Invalid forms and duplicate email handling (Customer & Technician).
- Role rules from UI and server side (cross-role access blocked).
- Responsive layouts (mobile + desktop).
- Forgot-password required-email validation and deferred-delivery guidance.
- Reset-link and password-update states when Resend delivery is implemented.

## Demo accounts (seed)
```
Admin: admin@fieldflow.test / ADMIN_DEMO_PASSWORD
Dispatcher: dispatch@fieldflow.test / DISPATCHER_DEMO_PASSWORD
Technician: tech@fieldflow.test / TECHNICIAN_DEMO_PASSWORD
```

## Quality gates before merge
- TypeScript strict mode passes.
- Small, regular commits; feature branches.
- `npm run build` succeeds.
- Playwright suite green for the flows above.

## Test data
- Seed via `prisma/seed.ts`: 3 demo users (one per role), sample customers, technicians, and work orders in multiple statuses.
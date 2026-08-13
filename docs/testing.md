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
- Reset password / auth error states where relevant.

## Demo accounts (seed)
```
Admin: admin@fieldflow.test / Demo password
Dispatcher: dispatch@fieldflow.test / Demo password
Technician: tech@fieldflow.test / Demo password
```

## Quality gates before merge
- TypeScript strict mode passes.
- Small, regular commits; feature branches.
- `npm run build` succeeds.
- Playwright suite green for the flows above.

## Test data
- Seed via `prisma/seed.ts`: 3 demo users (one per role), sample customers, technicians, and work orders in multiple statuses.
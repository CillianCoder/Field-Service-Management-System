# Conventions

## Code style & structure
- TypeScript strict mode.
- Next.js App Router with Server Actions; no microservices / Redis / API gateway for core.
- Boundaries: interface / logic / data separated (see `features/` structure).
- Folder structure : `app/`, `components/{ui,forms,tables,layout}`, `features/`, `lib/`, `prisma/`, `tests/`.
- Use shadcn/ui for components (optional but preferred).
- No comments unless they explain non-obvious intent.

## Naming rules
- Branches: `feature/short-description`, `fix/short-description`, `chore/...`
  - e.g. `feature/customer-crud`, `feature/technician-assignment`, `fix/dashboard-empty-state`
- Commits: Conventional Commits `type(scope): description`
  - e.g. `feat(customers): add search by email and phone`
  - No bare `fix`, `update`, `wip`.
- Files: readable feature names.
- Enums in Prisma: `Role`, `TechStatus`, `WOStatus`, `Priority`.

## Error handling
- Zod-validate all untrusted input; surface field-level messages.
- No stack traces to users.
- Loading, empty, and error states on every page.

## Security rules
- Authorize every protected server action (not just UI hiding).
- Cross-role access blocked server-side.
- Passwords hashed via auth library; never plain text.
- Secrets only in env vars; commit only `.env.example` with no values.
- No secrets, real credentials, or real customer data in the repo.

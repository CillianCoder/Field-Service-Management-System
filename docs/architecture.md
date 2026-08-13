# Architecture

## Overview
**FieldFlow** — Field Service Management System. Dispatchers assign work orders (jobs) to field service technicians; technicians start and complete them on the job site. Admins manage users and roles.

Final output: live deployed system.

## Components
Single Next.js application (App Router, React, TypeScript strict).

```
Browser Pages → Server Actions/Routes → Auth & Validation → Prisma ORM → Neon PostgreSQL
```

- **Next.js App Router** — pages + server actions.
- **Better Auth** — email/password sessions, persists after refresh.
- **Zod** — validation of all untrusted form data.
- **Prisma** — schema, migrations, seed data (5 core models).
- **Neon** — hosted PostgreSQL.
- **Tailwind CSS** (+ optional shadcn/ui) — styling.
- **Playwright** — e2e tests for main user flow.
- **Vercel** — deployment.

## Modules & dependencies
```
Auth → Role Access → Customers + Technicians → Work Orders → Dashboard
```
1. Auth — sign-in/sign-out, session persistence, protected pages.
2. Role Access — 3 roles, server-side enforcement, role-aware navigation.
3. Customers — CRUD + search.
4. Technicians — CRUD + filter, linked to User accounts.
5. Work Orders — main feature, full lifecycle.
6. Dashboard — counts, recent jobs, quick links.

## Deployment topology
- Web-only single app. No mobile client.
- Deployment on Vercel; DB on Neon.
- Demo data seeded via `prisma db seed`, safe for reviewers.

## Data flow for a typical field job
```
Create WO → Assign Tech → Tech Starts → Add Notes → Complete
1. Dispatcher creates WorkOrder (customer required).
2. Dispatcher assigns technician → status ASSIGNED.
3. Technician (own job only) Starts Work → IN_PROGRESS.
4. Technician adds progress notes (WorkOrderActivity). - need recheck
5. Technician completes with notes → COMPLETED + completedAt + completedById recorded.
```
Every status change writes a WorkOrderActivity (user + timestamp).
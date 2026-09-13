# FieldFlow

FieldFlow is a field service management web application built for dispatch teams,
field technicians, and operations managers. It helps coordinate jobs, assign work,
track technician status, and maintain a clear operational overview in one system.

Status: Core workflow implemented and verified for the main field-service use case.

## Overview

FieldFlow is designed for service-based businesses that need to manage:

- customers and service sites
- technician assignments
- work-order lifecycle tracking
- operational dashboard metrics
- role-based access for admins, dispatchers, and technicians

The system uses a Next.js App Router front end with Prisma and PostgreSQL on the
backend, plus Better Auth for secure login and session management.

## Core features

### Admin & dispatcher tools

- user creation and role management
- customer management with validation
- technician record management
- work-order creation and assignment
- dashboard overview with summary metrics and recent activity
- cancellation handling for valid job states

### Technician workflows

- assignment-based job access
- job start and completion actions
- progress notes and completion details
- technician availability and offline status handling

### Security and validation

- protected routes and server-side authorization
- Zod validation for all key inputs
- duplicate prevention for important records
- secure environment-based secrets handling

## Screenshots

<div align="center">
  <img src="docs/images/login.png" alt="FieldFlow login page" width="320" />
  <img src="docs/images/dashboard.png" alt="FieldFlow dashboard" width="320" />
</div>

<div align="center">
  <img src="docs/images/technician.png" alt="Technician workflow" width="320" />
  <img src="docs/images/work-order.png" alt="Work order management" width="320" />
</div>

## Architecture

```text
Browser UI → Server Actions → Auth + Validation → Prisma ORM → PostgreSQL
```

The app is structured around a single Next.js application with clear separation
between route logic, business actions, validation, and database access.

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Better Auth
- Prisma ORM
- PostgreSQL on Neon
- Playwright for validation flows

## Getting started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database
- Git

### Install

```bash
npm install
cp .env.example .env
```

### Configure environment variables

Update `.env` with your database and auth values.

### Run migrations and seed data

```bash
db:generate
npm run db:migrate
npm run db:seed
```

### Start the app

```bash
npm run dev
```

Open `http://localhost:3000` in the browser.

## Demo accounts

```text
Admin: admin@fieldflow.test / ADMIN_DEMO_PASSWORD
Dispatcher: dispatch@fieldflow.test / DISPATCHER_DEMO_PASSWORD
Technician: tech@fieldflow.test / TECHNICIAN_DEMO_PASSWORD
```

## Project structure

```text
app/
components/
features/
lib/
prisma/
tests/
docs/
```

## Deployment

The project is set up for deployment on Vercel with PostgreSQL on Neon.

Required environment variables include:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- demo password variables

Production verification checklist:

1. Set env vars in the deployment platform.
2. Run Prisma migrations.
3. Seed the database if demo accounts are needed.
4. Confirm login, role checks, and work-order flows work in production.

## Documentation

Detailed project documentation is available in:

- [docs/architecture.md](docs/architecture.md)
- [docs/api.md](docs/api.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/requirements.md](docs/requirements.md)
- [docs/testing.md](docs/testing.md)

## Roadmap / future work

The following items are intentionally kept in the backlog instead of being treated
as current project requirements:

- Resend-based email delivery for reset and invite flows
- invite-link onboarding flow
- disable/terminate account lifecycle
- audit trail for admin account actions
- broader Playwright regression coverage

## License

This project is licensed under the MIT License.

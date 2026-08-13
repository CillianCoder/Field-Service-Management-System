# FieldFlow

FieldFlow is a field service management system for dispatching work orders to
technicians and tracking work from assignment through completion.

## Stack

- Next.js App Router, React, and TypeScript strict mode
- Tailwind CSS
- Better Auth, Prisma, and Neon PostgreSQL
- Zod for server-side validation
- Playwright for end-to-end tests

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and provide local database and auth values.
3. Generate the Prisma client with `npm run db:generate` after the database
   schema is introduced.
4. Start the application with `npm run dev`.

The development server runs at `http://localhost:3000`.

## Available Commands

- `npm run dev` - run the development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run typecheck` - verify strict TypeScript
- `npm run format:check` - verify Prettier formatting
- `npm run test:e2e` - run Playwright tests
- `npm run db:generate` - generate the Prisma client
- `npm run db:migrate` - create and apply a Prisma migration
- `npm run db:seed` - seed safe demo data

## Project Structure

- `app/` - App Router pages, layouts, and route handlers
- `components/` - shared UI, form, table, and layout components
- `features/` - feature-specific interface, logic, and data modules
- `lib/` - shared utilities, validation schemas, auth, and Prisma access
- `prisma/` - Prisma schema, migrations, and seed data
- `tests/e2e/` - Playwright end-to-end tests

## Scaffold Status

The application shell, configuration, dependency boundaries, environment
template, and Playwright smoke test are in place. The Better Auth-compatible
Prisma schema and database migrations are intentionally deferred to the
authentication feature so the documented custom `User.passwordHash` model can
be reconciled with Better Auth's account and session models before data is
created.

No real credentials or customer data belong in this repository. Use only the
placeholder values in `.env.example`; local and deployment secrets must be
stored in environment configuration.

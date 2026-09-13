# FieldFlow

### Field service management for dispatch teams, technicians, and operations leads

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Status: Core workflow implemented and verified for the main field-service use case.

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

FieldFlow is a field service management web application built for dispatch teams,
field technicians, and operations managers. It helps coordinate jobs, assign work,
track technician status, and maintain a clear operational overview in one system.

The platform is designed for service-based businesses that need to manage:

- customer and service site records
- technician assignments and availability
- work-order lifecycle tracking
- operational dashboard metrics
- role-based access for admins, dispatchers, and technicians

The app uses a Next.js App Router front end with Prisma and PostgreSQL on the
backend, plus Better Auth for secure login and session-based access control.

## Features

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

The application is structured around a single Next.js app with clear separation
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
npx prisma generate
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

1. Set environment variables in the deployment platform.
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

## Roadmap

The following items are intentionally kept in the backlog instead of being treated
as current project requirements:

- Resend-based email delivery for reset and invite flows
- invite-link onboarding flow
- disable/terminate account lifecycle
- audit trail for admin account actions
- broader Playwright regression coverage

## License

This project is licensed under the MIT License.

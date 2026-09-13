# Architecture

## Overview

FieldFlow is a single-app field service management system built with Next.js.
The application allows dispatchers to manage customers, assign work orders, and
monitor operations while technicians complete jobs from their assigned work list.

## System flow

```text
Browser pages → Server actions → Auth + validation → Prisma ORM → PostgreSQL
```

### Primary layers

- Next.js App Router — page routing and server-side actions
- Better Auth — session management and email/password login
- Zod — validation for forms and untrusted inputs
- Prisma — database layer and migrations
- PostgreSQL (Neon) — production data store
- Tailwind CSS — responsive UI styling
- Playwright — end-to-end validation

## Core modules

```text
Auth → Role access → Customers → Technicians → Work Orders → Dashboard
```

1. Auth and sessions
   - login/logout flow
   - protected pages and route-level checks
   - role-aware redirects

2. Role access
   - Admin, Dispatcher, Technician roles
   - server-side enforcement for sensitive actions
   - role-specific navigation and feature visibility

3. Customers
   - create, read, update, and list customer records
   - duplicate validation and search support

4. Technicians
   - staff records and account linkage
   - offline/availability handling
   - assignment conflict checks

5. Work orders
   - create jobs and assign technicians
   - control lifecycle states from OPEN to COMPLETED
   - record status transitions as activity entries

6. Dashboard
   - operational summary values
   - recent work orders
   - quick access to daily job activity

## Typical job flow

```text
Create work order → assign technician → technician starts job → technician completes job
```

- Dispatcher creates the work order and selects a customer
- The office assigns a technician or leaves the job open
- The technician views only assigned jobs in the personal job list
- Starting the job updates the technician to BUSY
- Completing the job records completion notes and timestamps
- Each status change writes a WorkOrderActivity entry

## Deployment approach

- Single web app deployment on Vercel
- PostgreSQL database on Neon
- environment variables managed in deployment settings
- seed data used for demo and testing

## Current backlog items

The following are intentionally not treated as part of the current completed system:

- Resend-based email delivery for invite/reset flows
- admin plugin evaluation and optional future enhancement
- disable/terminate account lifecycle
- account-level audit trail
- broader Playwright regression suite

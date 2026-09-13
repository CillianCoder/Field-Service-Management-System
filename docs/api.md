# API and server actions

The project uses the Next.js App Router with server actions instead of a separate
REST API layer. The main data operations are performed through authenticated
server actions backed by Prisma.

## Core conventions

- Better Auth manages login sessions and protected page access.
- Every protected action validates the current user and role on the server.
- Zod validates all untrusted form inputs before database writes.
- Errors are user-friendly and do not leak internal stack traces.
- Revalidation is used after create and update operations so list pages refresh.

## Route map

| Route | Main users | Purpose |
|-------|------------|---------|
| `/login` | All | Sign in |
| `/forgot-password` | All | Shared guidance flow until email delivery is configured |
| `/dashboard` | Admin, Dispatcher | Operational overview |
| `/customers` | Admin, Dispatcher | Customer management |
| `/users` | Admin | User account and role management |
| `/technicians` | Admin, Dispatcher | Technician management |
| `/work-orders` | Admin, Dispatcher | Work-order directory and filters |
| `/work-orders/new` | Admin, Dispatcher | New job creation |
| `/work-orders/[id]` | Admin, Dispatcher, Technician | Job detail view |
| `/my-jobs` | Technician | Assigned jobs only |

## Implemented actions

| Action | Roles | Notes |
|--------|-------|-------|
| Create user | Admin | Account and role creation via server action |
| Manage roles | Admin | Self-demotion and role safety checks |
| Create customer | Admin, Dispatcher | duplicate email validation |
| Edit customer | Admin, Dispatcher | updates existing record |
| Create technician | Admin, Dispatcher | linked user + technician profile |
| Edit technician | Admin, Dispatcher | status and profile updates |
| Set technician offline | Admin, Dispatcher | blocks assignment if active jobs exist |
| Create work order | Admin, Dispatcher | customer required, assignment validation |
| Assign technician | Admin, Dispatcher | updates status and records activity |
| View technician jobs | Technician | own assigned jobs only |
| Start job | Technician | requires assigned status |
| Complete job | Technician | requires final notes |
| Cancel work order | Admin, Dispatcher | only valid for OPEN/ASSIGNED jobs |

## Important behavior

- The `/work-orders` list supports query filtering and preserves search state.
- The `/my-jobs` page resolves the technician from the authenticated user before querying work orders.
- Job status changes write `WorkOrderActivity` entries with timestamps and actor information.
- Assigning to an offline technician is rejected.
- Technician offline transitions require explicit confirmation when active jobs exist.
- Cancellation is allowed only for valid active states and requires a reason.

## Error handling

- Invalid form input → field error messages from Zod
- Unauthorized access → redirect or denial based on role
- Duplicate email → clear validation message
- Missing or invalid records → handled in server action logic

## Future backlog

The following are not part of the current production-ready implementation:

- Resend-based password reset and invite email delivery
- reset-token flow and reset-password page
- invite-link onboarding with first-time password setup
- account disable/terminate lifecycle
- audit history for user management changes

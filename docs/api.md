# API

Next.js App Router — no separate REST API. Data access via **Server Actions / Route Handlers** backed by Prisma. All server actions must re-validate and authorize.

## Conventions
- **Auth**: Better Auth sessions (email/password). Session persists after refresh.
- **Authorization**: every protected server action checks role server-side. Not just hidden buttons.
- **Validation**: Zod schemas for all untrusted form data (`lib/validations/`).
- **Errors**: user-facing messages; never expose stack traces.
- **Data flow**: react hook form (optional) → server action → Zod → Prisma.

Better Auth is mounted at `/api/auth/[...all]`. Public sign-up is disabled.
Admin and Dispatcher users can provision Technician accounts through the
protected `/technicians` server action. The User, credential Account, and
Technician profile are created atomically, and Better Auth hashes the initial
password before it is stored in `Account.password`.

## Route map
| Route | Main User | Purpose |
|-------|-----------|---------|
| `/login` | All | Sign in |
| `/forgot-password` | All | Validate a recovery email and show administrator guidance |
| `/dashboard` | Admin, Dispatcher | Operations summary |
| `/customers` | Admin, Dispatcher | Search and manage customers |
| `/users` | Admin | Manage accounts & roles |
| `/customers` | Admin, Dispatcher | Customer CRUD |
| `/technicians` | Admin, Dispatcher | Search, filter, create, and edit technicians |
| `/work-orders` | Admin, Dispatcher | List, filter, manage |
| `/work-orders/new` | Admin, Dispatcher | Create work order |
| `/work-orders/[id]` | Admin, Dispatcher, Technician | View a job; technicians can view assigned jobs only |
| `/my-jobs` | Technician | Assigned jobs only |

## Key actions
| Action | Roles | Server rule |
|--------|-------|-------------|
| Manage users/roles | Admin only | 403 otherwise |
| Search users | Admin only | searches account name and email |
| Edit user role | Admin only | self-demotion blocked; technician role requires a Technician profile |
| Create customers | Admin, Dispatcher | duplicate email blocked |
| Create technicians | Admin, Dispatcher | User, credential Account, and Technician created atomically |
| Edit technicians | Admin, Dispatcher | User and Technician name/email remain synchronized |
| Set technician Offline | Admin, Dispatcher | active-job conflicts require explicit confirmation |
| Create WOs | Admin, Dispatcher | customer, title, desc, scheduled date required |
| Assign technician | Admin, Dispatcher | sets ASSIGNED |
| View WOs | Admin, Dispatcher | all |
| View jobs | Technician | own only |
| Start work | all (own) | requires assigned technician |
| Complete job | all (own) | completion notes required |
| Cancel work order | Admin, Dispatcher | only `OPEN` or `ASSIGNED`; reason required; terminal `CANCELLED` state |

The Admin/Dispatcher `/work-orders` directory accepts URL parameters for
`search`, `status`, `priority`, `sort`, and `page`. Search matches the public
job number (`WO-0001`), title, customer, and technician. Pagination links
preserve the active filters, while filter submissions reset to page one.

The `/work-orders/new` form validates all fields server-side. A customer is
required, a technician is optional, and a new assignment cannot target an
`OFFLINE` technician. New unassigned jobs start as `OPEN`; jobs created with a
valid non-offline technician start as `ASSIGNED`. Creation and its initial
`STATUS_CHANGED` activity are committed in one transaction. The dashboard,
work-order directory, and technician job list are revalidated after creation.

The `/my-jobs` page reads URL parameters for `search`, `status`, `priority`, and
`sort`. The server resolves the technician from the authenticated user ID before
querying work orders, so client-provided technician IDs are never trusted.
Work orders have an internal CUID and a separate unique numeric `jobNumber`.
The UI displays the public number as `WO-0001`; server actions continue using
the internal work-order ID.

Technician job actions are implemented as a server action. `START` transitions
`ASSIGNED` to `IN_PROGRESS`; `COMPLETE` transitions `IN_PROGRESS` to
`COMPLETED` and requires notes. Each action writes a `WorkOrderActivity` row in
the same transaction as the work-order update. Starting work also sets the
Technician to `BUSY`. Completing the final in-progress job returns a non-Offline
Technician to `AVAILABLE`. The My Jobs query also returns
the assigned customer's name, address, phone, email, and chronological activity
records for the technician's job-history display.

Setting a Technician to `OFFLINE` does not unassign existing work. When active
assigned or in-progress jobs exist, the edit form shows their counts and the
server action requires explicit confirmation. Offline technicians must be
excluded from future assignment options.

The `/technicians` directory uses URL-backed `search`, `status`, and `page`
parameters. Pagination links preserve active filters, filter submissions reset
to the first page, and browser Back/Forward restores the previous directory
state.

The work-order detail cancellation server action authorizes Admin or Dispatcher roles,
validates a non-empty reason, allows cancellation only from `OPEN` or `ASSIGNED`,
updates the work order and writes the `STATUS_CHANGED` activity in one
transaction. Cancelled work orders remain searchable and visible as history but
are excluded from active workload and overdue counts. Technicians cannot invoke
the cancellation action.

## Error responses
- Invalid form → field-level Zod messages.
- Unauthorized → redirect to login (or role-appropriate page).
- Duplicate email → clear message on the field.

## Offline / sync
Not in scope. Web-only, live connection via server actions.

## Future auth improvements
- Configure Better Auth's `sendResetPassword` callback with Resend.
- Add secure reset-link expiry, invalid-token handling, and a reset-password page.
- Until email delivery is configured, `/forgot-password` sends no request and does
	not claim an email was sent or reveal whether an account exists.
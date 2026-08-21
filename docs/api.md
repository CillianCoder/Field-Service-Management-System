# API

Next.js App Router — no separate REST API. Data access via **Server Actions / Route Handlers** backed by Prisma. All server actions must re-validate and authorize.

## Conventions
- **Auth**: Better Auth sessions (email/password). Session persists after refresh.
- **Authorization**: every protected server action checks role server-side. Not just hidden buttons.
- **Validation**: Zod schemas for all untrusted form data (`lib/validations/`).
- **Errors**: user-facing messages; never expose stack traces.
- **Data flow**: react hook form (optional) → server action → Zod → Prisma.

Better Auth is mounted at `/api/auth/[...all]`. Public sign-up is disabled;
administrator-managed account creation will be added with the user-management
feature. Credential password hashes are stored in Better Auth's `Account`
model.

## Route map
| Route | Main User | Purpose |
|-------|-----------|---------|
| `/login` | All | Sign in |
| `/forgot-password` | All | Validate a recovery email and show administrator guidance |
| `/dashboard` | Admin, Dispatcher | Operations summary |
| `/users` | Admin | Manage accounts & roles |
| `/customers` | Admin, Dispatcher | Customer CRUD |
| `/technicians` | Admin, Dispatcher | Technician CRUD |
| `/work-orders` | Admin, Dispatcher | List, filter, manage |
| `/work-orders/new` | Admin, Dispatcher | Create work order |
| `/work-orders/[id]` | Role-based | View/update single job |
| `/my-jobs` | Technician | Assigned jobs only |

## Key actions
| Action | Roles | Server rule |
|--------|-------|-------------|
| Manage users/roles | Admin only | 403 otherwise |
| Create customers | Admin, Dispatcher | duplicate email blocked |
| Create technicians | Admin, Dispatcher | userId link required |
| Create WOs | Admin, Dispatcher | customer, title, desc, scheduled date required |
| Assign technician | Admin, Dispatcher | sets ASSIGNED |
| View WOs | Admin, Dispatcher | all |
| View jobs | Technician | own only |
| Start work | all (own) | requires assigned technician |
| Complete job | all (own) | completion notes required |

The `/my-jobs` page reads URL parameters for `search`, `status`, `priority`, and
`sort`. The server resolves the technician from the authenticated user ID before
querying work orders, so client-provided technician IDs are never trusted.
Work orders have an internal CUID and a separate unique numeric `jobNumber`.
The UI displays the public number as `WO-0001`; server actions continue using
the internal work-order ID.

Technician job actions are implemented as a server action. `START` transitions
`ASSIGNED` to `IN_PROGRESS`; `COMPLETE` transitions `IN_PROGRESS` to
`COMPLETED` and requires notes. Each action writes a `WorkOrderActivity` row in
the same transaction as the work-order update. The My Jobs query also returns
the assigned customer's name, address, phone, email, and chronological activity
records for the technician's job-history display.

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
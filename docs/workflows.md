# Workflows & Business Rules

## Job lifecycle
```
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
	└──────────────→ CANCELLED
```
1. **Create** — Dispatcher/Admin creates WorkOrder (customer required).
2. **Assign** — Dispatcher/Admin assigns a technician → ASSIGNED.
3. **Start** — Technician starts own job → IN_PROGRESS.
4. **Update** — Technician adds progress notes.
5. **Complete** — Technician completes with notes → COMPLETED (completedAt + completedById recorded).
6. **Cancel** — Admin or Dispatcher cancels an `OPEN` or `ASSIGNED` job with a required reason → CANCELLED.

Every status update writes a WorkOrderActivity: action, fromValue, toValue, userId, timestamp.

## Role-based flows

### Admin
- Manage users & roles (`/users`).
- All data access: customers, technicians, work orders, dashboard.

### Dispatcher
- Manage customers and technicians (create, view, edit).
- Create, assign, track work orders.
- **Cannot** manage users/roles.

### Technician
- `/my-jobs` only — jobs assigned to them.
- Start Work (OPEN/ASSIGNED → IN_PROGRESS).
- Progress notes / update messages.
- Complete Job (requires completion notes).
- History of completed jobs.
- **Blocked** from accessing other technicians' jobs (server-side).

## Business rules (server-enforced)
- Only Admin & Dispatcher can assign jobs.
- Technician sees only own jobs.
- Job cannot start without technician assigned.
- Job cannot complete without completion notes.
- Completion notes required for COMPLETED status.
- Every status update records user + timestamp.
- Only Admin and Dispatcher can cancel work orders.
- Cancellation requires a reason and creates a `WorkOrderActivity` audit record.
- `CANCELLED` is terminal; cancelled work orders cannot be started, completed, or reopened.
- Cancelled work orders are excluded from active technician workload and overdue counts.
- Duplicate email prevention (Customer & Technician).

## Authorization & security rules
- Every protected server action must authorize.
- Validate all untrusted form data (Zod).
- Passwords hashed through auth library — never plain text.
- Secrets in environment variables only.
- No stack traces exposed to users.
- Block cross-role access on server, not just UI.

## UI rules (every list page)
- Search or filters required.
- Readable dates and statuses.
- Empty states — no blank "no data" screens.
- Do not rely on color alone for status.
- Keyboard-friendly forms.
- Confirm before destructive actions.
- Loading, empty, and error states.
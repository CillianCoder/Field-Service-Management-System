# Requirements

Scope reference. Detail lives in the matching design docs — `data-model.md`, `api.md`, `workflows.md`, `architecture.md`. This file must stay in sync when those change.

Role codes: Admin (ADM) · Dispatcher (DSP) · Technician (TECH)

## Functional requirements

| ID | Requirement | Role | Detail |
|----|-------------|------|--------|
| FR-01 | Sign in with email/password; session persists across refresh | All | Better Auth |
| FR-02 | CRUD customers with search | ADM, DSP | `/customers`; data-model.md |
| FR-03 | CRUD technicians linked to User accounts | ADM, DSP | data-model.md |
| FR-04 | Create work order (customer required) | DSP, ADM | workflows.md |
| FR-05 | Assign work order to a technician | DSP, ADM | workflows.md |
| FR-06 | Technician views, starts, updates, and completes own jobs only | TECH | `/my-jobs`, server-enforced |
| FR-07 | Completions require notes; completedAt + completedById recorded | TECH | data-model.md |
| FR-08 | Every status change logged with user + timestamp | system | WorkOrderActivity |
| FR-09 | Duplicate email rejected (Customer + Technician) | system | data-model.md |
| FR-10 | Dashboard: counts, recent jobs, technician status, quick links, and cancellation workflow | ADM, DSP | architecture.md |
| FR-11 | Forgot-password page validates email and directs users to an administrator until email delivery is implemented | All | api.md |

## Validation rules
- Email: valid format; unique per Customer AND per Technician.
- All untrusted form data Zod-validated server-side — never trust the client.
- Ref: `lib/validations/`.

## Non-functional requirements

| ID | Requirement | Measure |
|----|-------------|---------|
| NFR-01 | Responsive: desktop + mobile | Playwright viewport tests |
| NFR-02 | Accessible: keyboard-navigable, status not color-only | a11y check |
| NFR-03 | Security: every protected server action authorizes | no cross-role fetch |
| NFR-04 | Passwords hashed (auth lib), secrets in env only | audit |
| NFR-05 | Empty states, loading, error states on every list page | UI review |

## Acceptance criteria
- **Auth**: wrong password → visible error, no stack trace leak.
- **Customers/Techs**: invalid form shows errors; duplicate email blocked; empty state shown when no rows.
- **Work Orders**: DSP assigns → TECH sees job in `/my-jobs`; unassigned job cannot start.
- **My Jobs**: technician sees active/in-progress/completed counts, URL-backed search/filter/sort controls, public `WO-0001` references, customer contact details, job history, and contextual start/complete actions.
- **Roles**: TECH blocked from `/users` and other technicians' jobs (server-side, not just UI).
- **Dashboard**: counts correct against seeded data.
- **Cancellation**: Admin/Dispatcher can cancel only `OPEN` or `ASSIGNED` jobs with a reason; the action is audited and cancelled jobs are excluded from active and overdue counts.

## Out of scope
- Cancellation after a job reaches `IN_PROGRESS` — requires a separate operational policy.
- Mobile client — web-only single app.
- Password-reset email delivery with Resend, reset-token handling, and password update — future improvement.
- Dark mode — future improvement.
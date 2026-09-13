# Requirements

This file captures the final project scope as implemented in the current codebase.
The completed system is aligned with the app behavior and server-side access
rules in the live code, not just the original planning notes.

Role codes: Admin, Dispatcher, Technician.

## Implemented requirements

| ID | Requirement | Role | Status |
|----|-------------|------|--------|
| FR-01 | Sign in with email and password | All | Implemented |
| FR-02 | Customer create, list, and edit flows | Admin, Dispatcher | Implemented |
| FR-03 | Technician management and status handling | Admin, Dispatcher | Implemented |
| FR-04 | Work order creation and assignment | Admin, Dispatcher | Implemented |
| FR-05 | Technician can view and act on assigned jobs only | Technician | Implemented |
| FR-06 | Job start and completion workflows with notes | Technician | Implemented |
| FR-07 | Work-order activity logging for status changes | System | Implemented |
| FR-08 | Duplicate email protection for customer and technician records | System | Implemented |
| FR-09 | Dashboard metrics and recent job views | Admin, Dispatcher | Implemented |
| FR-10 | Admin user management and role control | Admin | Implemented |
| FR-11 | Forgot-password page with administrator guidance | All | Implemented |
| FR-12 | Offline conflict checks for technicians with active jobs | Admin, Dispatcher | Implemented |
| FR-13 | Cancellation rules for OPEN and ASSIGNED jobs | Admin, Dispatcher | Implemented |

## Validation rules

- Email format and uniqueness validation is enforced.
- Untrusted form data must be validated server-side with Zod.
- Role checks are enforced on the server, not only in the UI.

## Non-functional requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-01 | Responsive desktop and mobile layouts | Implemented |
| NFR-02 | Protected routes and authorization checks | Implemented |
| NFR-03 | Secure secret handling via environment variables | Implemented |
| NFR-04 | Empty states, loading states, and error feedback | Implemented |
| NFR-05 | Accessible semantic styling and status cues | Implemented |

## Planned future backlog

These items are intentionally not included in the current completed scope:

- Resend-based email invite and reset flow
- secure reset-token lifecycle and reset page
- disable/terminate account action for users
- account audit trail and admin change history
- deeper automated Playwright regression coverage
- optional evaluation of Better Auth admin plugin

## Out of scope for this version

- mobile app client
- email-delivery based onboarding
- full user lifecycle management beyond the current admin create flow

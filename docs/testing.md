# Testing

## Current status

The project has completed development work and the current validation focus is on
stability, role enforcement, and the main operational flows. The basic local
checks for the app should be run before final review or deployment.

## Automated checks

Use the following commands from the project root:

```bash
npm run typecheck
npm run lint
npm run test:e2e
```

## Recommended verification flow

Before release, confirm the following:

- login works for Admin, Dispatcher, and Technician users
- protected routes reject unauthorized users
- customer creation and listing work correctly
- technician management and offline checks behave as expected
- work order creation and assignment work correctly
- technician job list shows only assigned jobs
- status transitions record activity correctly
- cancellation logic allows only valid transitions
- dashboard counts reflect the current data set

## Demo accounts

```text
Admin: admin@fieldflow.test / ADMIN_DEMO_PASSWORD
Dispatcher: dispatch@fieldflow.test / DISPATCHER_DEMO_PASSWORD
Technician: tech@fieldflow.test / TECHNICIAN_DEMO_PASSWORD
```

## Planned future testing

The following are included in the backlog and should be added as the project grows:

- richer Playwright flow coverage for full dispatch-to-completion scenarios
- email invite and password-reset validation when Resend is configured
- audit-trail review checks for account and role actions
- deeper regression validation for edge-case technician assignments

## Notes

The app is currently in a finished feature-development state for the core field
operations scope, but additional regression work and email-driven onboarding are
still future improvements rather than current requirements.

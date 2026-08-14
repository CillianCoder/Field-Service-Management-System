# Prisma

The Prisma schema contains the Better Auth tables and FieldFlow domain models. Generate the client after schema changes and create a reviewed migration before applying model changes to shared environments.

Better Auth owns credential hashes in `Account.password`. FieldFlow extends `User` with the application `Role`; do not add a separate `User.passwordHash` field.

The seed is idempotent and creates the documented demo users and credential accounts. Set `DATABASE_URL` and `DEMO_PASSWORD` before running `npm run db:seed`.

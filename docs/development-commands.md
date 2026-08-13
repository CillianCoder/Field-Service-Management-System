# Development Commands

Tech stack: Next.js App Router + TypeScript (strict) + Tailwind CSS + Prisma ORM + Neon PostgreSQL + Better Auth + Zod + Playwright + Vercel.

## Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill real values (never commit .env)
cp .env.example .env

# 3. Run the database migration (see Prisma section)
npx prisma migrate dev

# 4. Seed demo accounts
npm run db:seed

# 5. Run the dev server
npm run dev
```

## Environment Variables (`.env.example`)
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
BETTER_AUTH_SECRET=<long-random-string>
BETTER_AUTH_URL=http://localhost:3000
```

Rules:
- Never commit real secrets, tokens or passwords.
- Provide `.env.example` with placeholder values only.
- Real values live in Vercel environment settings.

## Prisma Commands
```bash
# Generate the client (after schema changes)
npx prisma generate

# Create a migration from schema changes
npx prisma migrate dev --name <migration-name>

# Push schema without a migration (quick local sync only)
npx prisma db push

# Open the database UI
npx prisma studio

# Show database state
npx prisma migrate status
```

## Seed Script
```bash
# Insert demo users (Admin, Dispatcher, Technician) + sample data
npm run db:seed
```

Demo accounts (seeded):
- Admin: `admin@fieldflow.test`
- Dispatcher: `dispatch@fieldflow.test`
- Technician: `tech@fieldflow.test`
- Password: Demo password (set via env)

## Build & Development
```bash
# Dev server with hot reload
npm run dev

# Production build (catches TS + lint errors)
npm run build

# Start the production build
npm start

# Lint
npm run lint

# Format
npm run format
```

## Testing
```bash
# Install Playwright browsers (first time)
npx playwright install

# Run the end-to-end main flow test
npx playwright test

# Run tests in headed mode (watch what happens)
npx playwright test --headed
```

## Deployment (Vercel)
1. Push code to the shared GitHub repository.
2. Import repo in Vercel.
3. Set environment variables in Vercel project settings.
4. Deploy and verify the live URL.

Before deploy:
- `npm run build` passes locally.
- Migration applied to production database.
- Seed ran with safe demo data.
- `README.md` has setup + demo login details.
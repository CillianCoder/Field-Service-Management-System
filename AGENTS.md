# AGENTS.md

Instructions for AI agents working on the Field Jobs Management System (FieldFlow).

## Stack
| Area | Choice |
|------|--------|
| Runtime | Node.js LTS + npm |
| Framework | Next.js App Router with React |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS, shadcn/ui (optional) |
| Authentication | Better Auth (email/password) |
| Database | PostgreSQL hosted on Neon |
| ORM | Prisma (migrations + seed data) |
| Validation | Zod, React Hook Form (optional) |
| Testing | Playwright (main user flow) |
| Deployment | Vercel (or approved Next.js host) |
| Version Control | Git + GitHub (shared repo) |

Architecture buckets:
```
Browser Pages → Server Actions/Routes → Auth & Validation → Prisma ORM → Neon PostgreSQL
```
Single Next.js app. No microservices, Redis, or API gateway for core.

## Quickstart
1. Install deps: `npm install`
2. Set env vars: copy `.env.example` → `.env` and fill DATABASE_URL etc. (never commit `.env`)
3. Run migrations: `npx prisma migrate dev`
4. Seed demo accounts: `npx prisma db seed`
5. Run dev server: `npm run dev`

## Tests & lint
- Playwright e2e for main user flow: `npx playwright test`
- Tests must cover: invalid forms, duplicate email handling, role rules (UI + server), responsive layouts.
- No separate lint config yet — follow `docs/conventions.md` and TypeScript strict mode.

## How to work here
1. Read `docs/` before touching code. Start with `docs/architecture.md`.
2. Follow `docs/conventions.md` and `docs/code-patterns.md`.
3. Use commands from `docs/development-commands.md`.
4. When changing data model, API, or features, update the matching doc (`docs/data-model.md`, `docs/api.md`, `docs/requirements.md`).
5. Never commit secrets. Keep env vars in `.env*` (gitignored). Use `.env.example` without values.
6. Authorize every protected server action. Validate all untrusted input with Zod.

## Repo map
```
app/
├── (auth)/login/          # sign in
├── (dashboard)/
│   ├── dashboard/         # ops summary (Admin, Dispatcher)
│   ├── users/             # Admin only
│   ├── customers/         # CRUD
│   ├── technicians/       # CRUD
│   ├── work-orders/[id]/  # detail
│   ├── work-orders/new/   # create
│   └── my-jobs/           # Technician only
components/
├── ui/  forms/  tables/  layout/
features/
├── auth/  customers/  technicians/  work-orders/  dashboard/
lib/
├── auth.ts       # Better Auth config
├── prisma.ts     # Prisma client
├── validations/  # Zod schemas
└── utils.ts
prisma/
├── schema.prisma  migrations/  seed.ts
tests/e2e/
public/
```

## Demo credentials (must work after seed)
```
Admin: admin@fieldflow.test / Demo password
Dispatcher: dispatch@fieldflow.test / Demo password
Technician: tech@fieldflow.test / Demo password
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

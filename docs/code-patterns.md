# Code Patterns

Shared patterns for consistent, secure implementation. Follow these in every module.

## 1. Auth Guard (Server-Side)

Every protected action checks the signed-in user AND role on the server. Never rely on hidden buttons alone.

```ts
import { requireRole } from "@/lib/auth";

// app/api/work-orders/route.ts
export async function POST(req: Request) {
  const user = await requireRole(["ADMIN", "DISPATCHER"]);

  const body = await req.json();
  const parsed = createWorkOrderSchema.safeParse(body); // validate BEFORE writing
  if (!parsed.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
```

Rules:
- Blocked actions fail on the server (401/403), not only in the UI.
- Technician must only see their own jobs.
- Dispatcher cannot manage users.

## 2. Validation (Zod + React Hook Form)

Every form input passes a Zod schema before any database write.

```ts
// lib/validations/customer.ts
import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  address: z.string().min(5, "Address is required"),
});

export const technicianSchema = customerSchema.extend({
  skills: z.array(z.string()).min(1, "At least one skill"),
  status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]),
});
```

Rules:
- Validate all untrusted form data.
- Show clear inline error messages.
- Handle duplicate email errors (e.g. `email` unique constraint).
- Do not expose stack traces to users.

## 3. Prisma Data Access

One Prisma client instance, no `prisma = new PrismaClient()` per request.

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Use page-by-page queries with `include`/`select` to keep payloads small.

## 4. Work Order Status Flow

Job cannot skip states, start without technician, or complete without notes.

```
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
```

```ts
// lib/work-orders.ts
export const STATUS_FLOW: Record<string, string[]> = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
};
```

Rules:
- Assign requires a technicianId.
- Complete requires completionNotes.
- Every status update writes a `WorkOrderActivity` row (user + time).

## 5. Seed Pattern

Idempotent seed with `upsert` so it can run repeatedly without duplicates.

```ts
// prisma/seed.ts
const emails = {
  admin: "admin@fieldflow.test",
  dispatcher: "dispatch@fieldflow.test",
  technician: "tech@fieldflow.test",
};

for (const [name, email] of Object.entries(emails)) {
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash: await hashPassword(name) },
  });
}
```

Password hashing is handled by the auth library (never store plain text).

## 6. Role-Aware Navigation

Navigation shows only what the signed-in role can use. Server still re-checks every route.

```ts
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [dashboard, users, customers, technicians, workOrders],
  DISPATCHER: [dashboard, customers, technicians, workOrders],
  TECHNICIAN: [myJobs],
};
```

## Remember

- Server-side checks protect actions — hidden buttons are not security.
- Clear, small, regular commits with readable names.
- Every list page: search/filter, readable dates/statuses, empty states.
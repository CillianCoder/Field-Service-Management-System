# Data Model

## Entities

### User (via Better Auth)
```prisma
model User {
  id            String              @id
  name          String
  email         String              @unique
  emailVerified Boolean             @default(false)
  image         String?
  role          Role                @default(TECHNICIAN)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  accounts      Account[]
  sessions      Session[]
  technician    Technician?
  activities    WorkOrderActivity[]
}

model Account {
  id          String  @id
  accountId   String
  providerId  String
  userId      String
  password    String?
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  // OAuth token fields are omitted here for brevity.
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
}

enum Role {
  ADMIN
  DISPATCHER
  TECHNICIAN
}
```

### Customer
```prisma
model Customer {
  id          String      @id @default(cuid())
  name        String
  email       String      @unique
  phone       String
  address     String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  workOrders  WorkOrder[]
}
```

### Technician
```prisma
model Technician {
  id            String      @id @default(cuid())
  userId        String      @unique
  user          User        @relation(fields: [userId], references: [id])
  name          String
  email         String      @unique
  phone         String
  skills        String[]    // Array of skill strings
  status        TechStatus  @default(AVAILABLE)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  workOrders    WorkOrder[]
}

enum TechStatus {
  AVAILABLE
  BUSY
  OFFLINE
}
```

### WorkOrder (main feature)
```prisma
model WorkOrder {
  id              String        @id @default(cuid())
  jobNumber       Int           @unique @default(autoincrement()) // public reference, displayed as WO-0001
  title           String
  description     String
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  technicianId    String?
  technician      Technician?   @relation(fields: [technicianId], references: [id])
  priority        Priority      @default(MEDIUM)
  status          WOStatus      @default(OPEN)
  scheduledDate   DateTime
  completionNotes String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  completedAt     DateTime?
  completedById   String?
  activities      WorkOrderActivity[]
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum WOStatus {
  OPEN
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

`CANCELLED` is a terminal status. The cancellation reason is stored in the
corresponding `WorkOrderActivity.notes` value, together with the cancelling
user, timestamp, previous status, and new status. No separate cancellation
columns are required for the current workflow.

### WorkOrderActivity (audit trail)
```prisma
model WorkOrderActivity {
  id          String   @id @default(cuid())
  workOrderId String
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id])
  userId      String
  action      String   // e.g., "STATUS_CHANGED", "ASSIGNED", "COMPLETED"
  fromValue   String?
  toValue     String?
  notes       String?
  createdAt   DateTime @default(now())
}
```

## Relationships
- User 1:1 Technician (optional)
- User 1:N Account and Session (owned by Better Auth)
- Customer 1:N WorkOrder
- Technician 1:N WorkOrder
- WorkOrder 1:N WorkOrderActivity
- User 1:N WorkOrderActivity

## Schema / migrations
- Prisma schema in `prisma/schema.prisma`.
- Prisma 7 client output is generated into `generated/prisma` and uses the
  PostgreSQL driver adapter in `lib/prisma.ts`.
- Migrations via `npx prisma migrate dev`.
- Seed via `npx prisma db seed` (`prisma/seed.ts`).
- Passwords are hashed by Better Auth and stored in `Account.password`; do not
  add a `User.passwordHash` field.

## Statuses & state machine
Job flow (server-enforced):
```
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
```
- `CANCELLED` stays in the `WOStatus` enum but is a **future feature** — not implemented yet. No transition into it.
- Cannot start without technician assigned.
- Cannot complete without completion notes.
- Every status update records user + timestamp.
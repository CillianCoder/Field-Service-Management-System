# Data model

## Entities

### User (Better Auth)

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
  skills        String[]
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

Technician status is an operational availability state, not an account lifecycle
state. `BUSY` is set when a technician starts a job; the final in-progress
completion returns a non-offline technician to `AVAILABLE`.

### Work order

```prisma
model WorkOrder {
  id              String        @id @default(cuid())
  jobNumber       Int           @unique @default(autoincrement())
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

`CANCELLED` is implemented and is treated as a terminal status for the current
workflow. The cancellation reason and related context are recorded in the
corresponding activity row.

### WorkOrderActivity

```prisma
model WorkOrderActivity {
  id          String   @id @default(cuid())
  workOrderId String
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id])
  userId      String
  action      String
  fromValue   String?
  toValue     String?
  notes       String?
  createdAt   DateTime @default(now())
}
```

## Relationships

- User 1:1 Technician (optional)
- User 1:N Account and Session
- Customer 1:N WorkOrder
- Technician 1:N WorkOrder
- WorkOrder 1:N WorkOrderActivity
- User 1:N WorkOrderActivity

## Schema and migrations

- Prisma schema is in `prisma/schema.prisma`.
- Prisma client generation is handled through the app setup and generated output.
- Migrations are created and applied via Prisma CLI commands.
- Seed data is defined in `prisma/seed.ts`.

## Job state machine

```text
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
```

- Work orders cannot start without an assigned technician.
- Completion requires notes.
- Every status update is logged with the actor and timestamp.
- Cancellation is allowed only in valid job states and is recorded as activity.

## Planned future additions

The following are not part of the current finished scope:

- full account disable/terminate lifecycle
- admin change log for account and role actions
- email-based invite flow with secure token handling

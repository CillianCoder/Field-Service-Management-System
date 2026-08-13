# Data Model

## Entities (5 core models)

### User (via Better Auth)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(TECHNICIAN)
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  technician    Technician?
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
- Customer 1:N WorkOrder
- Technician 1:N WorkOrder
- WorkOrder 1:N WorkOrderActivity
- User 1:N WorkOrderActivity

## Schema / migrations
- Prisma schema in `prisma/schema.prisma`.
- Migrations via `npx prisma migrate dev`.
- Seed via `npx prisma db seed` (`prisma/seed.ts`).

## Statuses & state machine
Job flow (server-enforced):
```
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
```
- `CANCELLED` stays in the `WOStatus` enum but is a **future feature** — not implemented yet. No transition into it.
- Cannot start without technician assigned.
- Cannot complete without completion notes.
- Every status update records user + timestamp.
import "dotenv/config";

import { hashPassword } from "better-auth/crypto";

import type { Role } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const demoUsers = [
  {
    name: "FieldFlow Admin",
    email: "admin@fieldflow.test",
    role: "ADMIN",
    passwordEnv: "ADMIN_DEMO_PASSWORD",
  },
  {
    name: "FieldFlow Dispatcher",
    email: "dispatch@fieldflow.test",
    role: "DISPATCHER",
    passwordEnv: "DISPATCHER_DEMO_PASSWORD",
  },
  {
    name: "FieldFlow Technician",
    email: "tech@fieldflow.test",
    role: "TECHNICIAN",
    passwordEnv: "TECHNICIAN_DEMO_PASSWORD",
  },
] satisfies Array<{
  name: string;
  email: string;
  role: Role;
  passwordEnv:
    | "ADMIN_DEMO_PASSWORD"
    | "DISPATCHER_DEMO_PASSWORD"
    | "TECHNICIAN_DEMO_PASSWORD";
}>;

async function main() {
  const seededUsers = new Map<string, { id: string }>();

  for (const demoUser of demoUsers) {
    const password = process.env[demoUser.passwordEnv];

    if (!password || password.length < 12) {
      throw new Error(
        `${demoUser.passwordEnv} is required and must be at least 12 characters.`,
      );
    }

    const passwordHash = await hashPassword(password);
    const { passwordEnv: _passwordEnv, ...userData } = demoUser;
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        role: demoUser.role,
      },
      create: {
        id: crypto.randomUUID(),
        ...userData,
        emailVerified: true,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id,
        },
      },
      update: { password: passwordHash },
      create: {
        id: crypto.randomUUID(),
        providerId: "credential",
        accountId: user.id,
        userId: user.id,
        password: passwordHash,
      },
    });

    seededUsers.set(demoUser.email, user);
  }

  const technicianUser = seededUsers.get("tech@fieldflow.test");

  if (!technicianUser) {
    throw new Error("The demo technician user was not created.");
  }

  const technician = await prisma.technician.upsert({
    where: { userId: technicianUser.id },
    update: {
      name: "FieldFlow Technician",
      email: "tech@fieldflow.test",
      phone: "+1 555 010 2003",
      skills: ["HVAC", "Electrical", "Preventive maintenance"],
      status: "BUSY",
    },
    create: {
      userId: technicianUser.id,
      name: "FieldFlow Technician",
      email: "tech@fieldflow.test",
      phone: "+1 555 010 2003",
      skills: ["HVAC", "Electrical", "Preventive maintenance"],
      status: "BUSY",
    },
  });

  const northwind = await prisma.customer.upsert({
    where: { email: "northwind@fieldflow.test" },
    update: {
      name: "Northwind Office Park",
      phone: "+1 555 010 3001",
      address: "1200 Market Street, Springfield",
    },
    create: {
      name: "Northwind Office Park",
      email: "northwind@fieldflow.test",
      phone: "+1 555 010 3001",
      address: "1200 Market Street, Springfield",
    },
  });

  const lakeside = await prisma.customer.upsert({
    where: { email: "lakeside@fieldflow.test" },
    update: {
      name: "Lakeside Medical Center",
      phone: "+1 555 010 3002",
      address: "45 Lake Avenue, Springfield",
    },
    create: {
      name: "Lakeside Medical Center",
      email: "lakeside@fieldflow.test",
      phone: "+1 555 010 3002",
      address: "45 Lake Avenue, Springfield",
    },
  });

  const workOrders = [
    {
      id: "wo-northwind-hvac",
      jobNumber: 1,
      title: "Replace rooftop HVAC filter",
      description:
        "Replace the rooftop unit filters and inspect airflow readings.",
      customerId: northwind.id,
      priority: "HIGH" as const,
      status: "ASSIGNED" as const,
      scheduledDate: new Date("2026-08-20T09:00:00Z"),
    },
    {
      id: "wo-lakeside-panel",
      jobNumber: 2,
      title: "Inspect electrical panel",
      description:
        "Investigate intermittent power drops in the west wing panel.",
      customerId: lakeside.id,
      priority: "URGENT" as const,
      status: "IN_PROGRESS" as const,
      scheduledDate: new Date("2026-08-19T13:30:00Z"),
      completionNotes: null,
    },
    {
      id: "wo-northwind-pump",
      jobNumber: 3,
      title: "Service basement water pump",
      description:
        "Complete the scheduled pump service and record final pressure.",
      customerId: northwind.id,
      priority: "MEDIUM" as const,
      status: "COMPLETED" as const,
      scheduledDate: new Date("2026-08-18T10:00:00Z"),
      completionNotes:
        "Pump serviced and final pressure recorded within range.",
      completedAt: new Date("2026-08-18T11:20:00Z"),
      completedById: technicianUser.id,
    },
  ];

  for (const workOrderData of workOrders) {
    const workOrder = await prisma.workOrder.upsert({
      where: { id: workOrderData.id },
      update: {
        ...workOrderData,
        technicianId: technician.id,
      },
      create: {
        ...workOrderData,
        technicianId: technician.id,
      },
    });

    const activity = {
      workOrderId: workOrder.id,
      userId: technicianUser.id,
      action: "STATUS_CHANGED",
      fromValue:
        workOrder.status === "ASSIGNED"
          ? "OPEN"
          : workOrder.status === "IN_PROGRESS"
            ? "ASSIGNED"
            : "IN_PROGRESS",
      toValue: workOrder.status,
      notes:
        workOrder.status === "COMPLETED" ? workOrder.completionNotes : null,
    };

    const existingActivity = await prisma.workOrderActivity.findFirst({
      where: {
        workOrderId: workOrder.id,
        action: activity.action,
        toValue: activity.toValue,
      },
    });

    if (!existingActivity) {
      await prisma.workOrderActivity.create({ data: activity });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import "dotenv/config";

import { hashPassword } from "better-auth/crypto";

import type { Role } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const demoUsers = [
  {
    name: "FieldFlow Admin",
    email: "admin@fieldflow.test",
    role: "ADMIN",
  },
  {
    name: "FieldFlow Dispatcher",
    email: "dispatch@fieldflow.test",
    role: "DISPATCHER",
  },
  {
    name: "FieldFlow Technician",
    email: "tech@fieldflow.test",
    role: "TECHNICIAN",
  },
] satisfies Array<{ name: string; email: string; role: Role }>;

async function main() {
  const password = process.env.DEMO_PASSWORD;

  if (!password) {
    throw new Error("DEMO_PASSWORD is required to seed demo accounts.");
  }

  const passwordHash = await hashPassword(password);

  for (const demoUser of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        role: demoUser.role,
      },
      create: {
        id: crypto.randomUUID(),
        ...demoUser,
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

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

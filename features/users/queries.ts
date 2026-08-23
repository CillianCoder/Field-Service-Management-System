import "server-only";

import { prisma } from "@/lib/prisma";

export async function getUsers(search: string) {
  const normalizedSearch = search.trim();

  return prisma.user.findMany({
    where: normalizedSearch
      ? {
          OR: [
            { name: { contains: normalizedSearch, mode: "insensitive" } },
            { email: { contains: normalizedSearch, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      technician: {
        select: { status: true },
      },
    },
  });
}

import "server-only";

import { prisma } from "@/lib/prisma";

export async function getCustomers(search: string) {
  const normalizedSearch = search.trim();

  return prisma.customer.findMany({
    where: normalizedSearch
      ? {
          OR: [
            { name: { contains: normalizedSearch, mode: "insensitive" } },
            { email: { contains: normalizedSearch, mode: "insensitive" } },
            { phone: { contains: normalizedSearch, mode: "insensitive" } },
            { address: { contains: normalizedSearch, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { workOrders: true } } },
  });
}

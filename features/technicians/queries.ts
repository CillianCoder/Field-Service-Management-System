import { z } from "zod";

import { prisma } from "@/lib/prisma";

const technicianFiltersSchema = z.object({
  search: z.string().trim().max(120).catch(""),
  status: z.enum(["ALL", "AVAILABLE", "BUSY", "OFFLINE"]).catch("ALL"),
  page: z.coerce.number().int().min(1).catch(1),
});

const PAGE_SIZE = 10;

export type TechnicianFilters = z.infer<typeof technicianFiltersSchema>;

export function parseTechnicianFilters(
  params: Record<string, string | string[] | undefined>,
) {
  const value = (key: string) => {
    const entry = params[key];
    return Array.isArray(entry) ? entry[0] : entry;
  };

  return technicianFiltersSchema.parse({
    search: value("search"),
    status: value("status"),
    page: value("page"),
  });
}

export async function getTechnicians(filters: TechnicianFilters) {
  const where = {
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            {
              name: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              phone: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            { skills: { has: filters.search } },
          ],
        }
      : {}),
  };
  const total = await prisma.technician.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const technicians = await prisma.technician.findMany({
    where,
    orderBy: { name: "asc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      skills: true,
      status: true,
      _count: {
        select: {
          workOrders: {
            where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
          },
        },
      },
      workOrders: {
        where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        select: { status: true },
      },
    },
  });

  return {
    technicians,
    pagination: { page, pageSize: PAGE_SIZE, total, totalPages },
  };
}

export type TechnicianListItem = Awaited<
  ReturnType<typeof getTechnicians>
>["technicians"][number];

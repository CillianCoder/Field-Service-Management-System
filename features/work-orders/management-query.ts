import "server-only";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const workOrderManagementFiltersSchema = z.object({
  search: z.string().trim().max(100).catch(""),
  status: z
    .enum(["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .catch("ALL"),
  priority: z.enum(["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"]).catch("ALL"),
  sort: z.enum(["SOONEST", "LATEST", "PRIORITY", "UPDATED"]).catch("SOONEST"),
  page: z.coerce.number().int().min(1).catch(1),
});

const PAGE_SIZE = 8;

export type WorkOrderManagementFilters = z.infer<
  typeof workOrderManagementFiltersSchema
>;

export function parseWorkOrderManagementFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const value = (key: string) => {
    const parameter = searchParams[key];
    return Array.isArray(parameter) ? parameter[0] : parameter;
  };

  return workOrderManagementFiltersSchema.parse({
    search: value("search"),
    status: value("status"),
    priority: value("priority"),
    sort: value("sort"),
    page: value("page"),
  });
}

export async function getWorkOrderManagementData(
  filters: WorkOrderManagementFilters,
) {
  const publicJobNumber = Number.parseInt(
    filters.search.replace(/^wo[-#\s]*/i, ""),
    10,
  );
  const hasPublicJobNumberSearch = Number.isInteger(publicJobNumber);
  const where = {
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.priority !== "ALL" ? { priority: filters.priority } : {}),
    ...(filters.search
      ? {
          OR: [
            {
              title: { contains: filters.search, mode: "insensitive" as const },
            },
            {
              customer: {
                name: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              technician: {
                name: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            },
            ...(hasPublicJobNumberSearch
              ? [{ jobNumber: publicJobNumber }]
              : []),
          ],
        }
      : {}),
  };
  const orderBy =
    filters.sort === "LATEST"
      ? { scheduledDate: "desc" as const }
      : filters.sort === "UPDATED"
        ? { updatedAt: "desc" as const }
        : filters.sort === "PRIORITY"
          ? [{ priority: "asc" as const }, { scheduledDate: "asc" as const }]
          : { scheduledDate: "asc" as const };

  const total = await prisma.workOrder.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const workOrders = await prisma.workOrder.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      jobNumber: true,
      title: true,
      priority: true,
      status: true,
      scheduledDate: true,
      customer: { select: { name: true } },
      technician: { select: { name: true } },
    },
  });

  return {
    workOrders,
    pagination: { page, pageSize: PAGE_SIZE, total, totalPages },
  };
}

export async function getWorkOrderCreationOptions() {
  const [customers, technicians] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.technician.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, status: true },
    }),
  ]);

  return { customers, technicians };
}

export type ManagedWorkOrder = Awaited<
  ReturnType<typeof getWorkOrderManagementData>
>["workOrders"][number];

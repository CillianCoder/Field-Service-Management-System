import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const dashboardFiltersSchema = z.object({
  search: z.string().trim().max(100).catch(""),
  status: z
    .enum(["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .catch("ALL"),
  priority: z.enum(["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"]).catch("ALL"),
  page: z.coerce.number().int().min(1).catch(1),
  overdue: z.enum(["true", "false"]).catch("false"),
});

const PAGE_SIZE = 8;

export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;

export function parseDashboardFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const value = (key: string) => {
    const parameter = searchParams[key];
    return Array.isArray(parameter) ? parameter[0] : parameter;
  };

  return dashboardFiltersSchema.parse({
    search: value("search"),
    status: value("status"),
    priority: value("priority"),
    page: value("page"),
    overdue: value("overdue"),
  });
}

export async function getDashboardData(filters: DashboardFilters) {
  const publicJobNumber = Number.parseInt(
    filters.search.replace(/^wo[-#\s]*/i, ""),
    10,
  );
  const hasPublicJobNumberSearch = Number.isInteger(publicJobNumber);
  const searchWhere = filters.search
    ? ({
        OR: [
          { title: { contains: filters.search, mode: "insensitive" as const } },
          {
            customer: {
              name: { contains: filters.search, mode: "insensitive" as const },
            },
          },
          {
            technician: {
              name: { contains: filters.search, mode: "insensitive" as const },
            },
          },
          ...(hasPublicJobNumberSearch ? [{ jobNumber: publicJobNumber }] : []),
        ],
      } satisfies Prisma.WorkOrderWhereInput)
    : undefined;
  const workOrderWhere = {
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.priority !== "ALL" ? { priority: filters.priority } : {}),
    ...(filters.overdue === "true"
      ? {
          scheduledDate: { lt: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        }
      : {}),
    ...(searchWhere ?? {}),
  } satisfies Prisma.WorkOrderWhereInput;

  const [statusCounts, overdue, total, recentWorkOrders, technicians] =
    await Promise.all([
      prisma.workOrder.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.workOrder.count({
        where: {
          scheduledDate: { lt: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      prisma.workOrder.count({ where: workOrderWhere }),
      prisma.workOrder.findMany({
        where: workOrderWhere,
        orderBy: { updatedAt: "desc" },
        skip: (filters.page - 1) * PAGE_SIZE,
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
      }),
      prisma.technician.findMany({
        orderBy: { name: "asc" },
        take: 8,
        select: {
          id: true,
          name: true,
          status: true,
          phone: true,
          _count: {
            select: {
              workOrders: {
                where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
              },
            },
          },
        },
      }),
    ]);

  const countByStatus = new Map(
    statusCounts.map((entry) => [entry.status, entry._count._all]),
  );

  return {
    counts: {
      open: countByStatus.get("OPEN") ?? 0,
      assigned: countByStatus.get("ASSIGNED") ?? 0,
      inProgress: countByStatus.get("IN_PROGRESS") ?? 0,
      completed: countByStatus.get("COMPLETED") ?? 0,
      overdue,
    },
    recentWorkOrders,
    technicians,
    pagination: {
      page: filters.page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

import "server-only";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const workOrderFiltersSchema = z.object({
  search: z.string().trim().max(100).catch(""),
  status: z.enum(["ALL", "ASSIGNED", "IN_PROGRESS", "COMPLETED"]).catch("ALL"),
  priority: z.enum(["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"]).catch("ALL"),
  sort: z.enum(["SOONEST", "LATEST", "PRIORITY", "UPDATED"]).catch("SOONEST"),
});

export type WorkOrderFilters = z.infer<typeof workOrderFiltersSchema>;

const priorityRank = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

export function parseWorkOrderFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const value = (key: string) => {
    const parameter = searchParams[key];
    return Array.isArray(parameter) ? parameter[0] : parameter;
  };

  return workOrderFiltersSchema.parse({
    search: value("search"),
    status: value("status"),
    priority: value("priority"),
    sort: value("sort"),
  });
}

export async function getMyJobs(userId: string, filters: WorkOrderFilters) {
  const technician = await prisma.technician.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!technician) {
    return {
      counts: { active: 0, inProgress: 0, completed: 0 },
      jobs: [],
    };
  }

  const publicJobNumber = Number.parseInt(
    filters.search.replace(/^wo[-#\s]*/i, ""),
    10,
  );
  const hasPublicJobNumberSearch = Number.isInteger(publicJobNumber);

  const baseWhere = {
    technicianId: technician.id,
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.priority !== "ALL" ? { priority: filters.priority } : {}),
    ...(filters.search
      ? {
          OR: [
            { id: { contains: filters.search, mode: "insensitive" as const } },
            ...(hasPublicJobNumberSearch
              ? [{ jobNumber: publicJobNumber }]
              : []),
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
          ],
        }
      : {}),
  };

  const [counts, jobs] = await Promise.all([
    prisma.workOrder.groupBy({
      by: ["status"],
      where: { technicianId: technician.id },
      _count: { _all: true },
    }),
    prisma.workOrder.findMany({
      where: baseWhere,
      select: {
        id: true,
        jobNumber: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        scheduledDate: true,
        updatedAt: true,
        customer: {
          select: { name: true, address: true, phone: true, email: true },
        },
        activities: {
          select: {
            id: true,
            action: true,
            fromValue: true,
            toValue: true,
            notes: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy:
        filters.sort === "LATEST"
          ? { scheduledDate: "desc" }
          : filters.sort === "UPDATED"
            ? { updatedAt: "desc" }
            : { scheduledDate: "asc" },
    }),
  ]);

  const countByStatus = new Map(
    counts.map((entry) => [entry.status, entry._count._all]),
  );

  if (filters.sort === "PRIORITY") {
    jobs.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }

  return {
    counts: {
      active:
        (countByStatus.get("ASSIGNED") ?? 0) +
        (countByStatus.get("IN_PROGRESS") ?? 0),
      inProgress: countByStatus.get("IN_PROGRESS") ?? 0,
      completed: countByStatus.get("COMPLETED") ?? 0,
    },
    jobs,
  };
}

export type MyJob = Awaited<ReturnType<typeof getMyJobs>>["jobs"][number];

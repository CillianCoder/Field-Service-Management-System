import "server-only";

import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function getWorkOrderForViewer(
  workOrderId: string,
  role: Role,
  userId: string,
) {
  const technicianFilter =
    role === "TECHNICIAN" ? { user: { id: userId } } : undefined;

  return prisma.workOrder.findFirst({
    where: {
      id: workOrderId,
      ...(technicianFilter ? { technician: technicianFilter } : {}),
    },
    select: {
      id: true,
      jobNumber: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      scheduledDate: true,
      createdAt: true,
      updatedAt: true,
      completionNotes: true,
      completedAt: true,
      customer: {
        select: { name: true, address: true, phone: true, email: true },
      },
      technician: {
        select: { name: true, email: true, phone: true },
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
  });
}

export type WorkOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkOrderForViewer>>
>;

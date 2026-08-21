"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import {
  initialJobActionState,
  type JobActionState,
} from "@/features/work-orders/action-state";

const jobActionSchema = z.object({
  workOrderId: z.string().min(1),
  action: z.enum(["START", "NOTE", "COMPLETE"]),
  notes: z.string().trim().max(2000).catch(""),
});

export async function updateMyJob(
  _previousState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const session = await requireRole(["TECHNICIAN"]);
  const parsed = jobActionSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    action: formData.get("action"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "This job update is invalid. Please try again." };
  }

  const technician = await prisma.technician.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!technician) {
    return { error: "Your technician profile could not be found." };
  }

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: parsed.data.workOrderId,
      technicianId: technician.id,
    },
    select: { id: true, status: true, completionNotes: true },
  });

  if (!workOrder) {
    return { error: "This job is not assigned to you." };
  }

  const nextStatus =
    parsed.data.action === "START"
      ? "IN_PROGRESS"
      : parsed.data.action === "COMPLETE"
        ? "COMPLETED"
        : null;

  if (parsed.data.action === "COMPLETE" && !parsed.data.notes) {
    return { error: "Completion notes are required to complete a job." };
  }

  if (parsed.data.action === "NOTE" && !parsed.data.notes) {
    return { error: "Enter a progress note before saving." };
  }

  const validTransition =
    (workOrder.status === "ASSIGNED" && nextStatus === "IN_PROGRESS") ||
    (workOrder.status === "IN_PROGRESS" && nextStatus === "COMPLETED") ||
    (workOrder.status === "IN_PROGRESS" && parsed.data.action === "NOTE");

  if (!validTransition) {
    return { error: "This job cannot be updated from its current status." };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      if (nextStatus) {
        await transaction.workOrder.update({
          where: { id: workOrder.id },
          data: {
            status: nextStatus,
            ...(nextStatus === "COMPLETED"
              ? {
                  completionNotes: parsed.data.notes,
                  completedAt: new Date(),
                  completedById: session.user.id,
                }
              : {}),
          },
        });
      }

      await transaction.workOrderActivity.create({
        data: {
          workOrderId: workOrder.id,
          userId: session.user.id,
          action:
            parsed.data.action === "NOTE" ? "NOTE_ADDED" : "STATUS_CHANGED",
          fromValue: nextStatus ? workOrder.status : null,
          toValue: nextStatus,
          notes: parsed.data.notes || null,
        },
      });
    });
  } catch {
    return { error: "The job could not be updated. Please try again." };
  }

  revalidatePath("/my-jobs");
  return initialJobActionState;
}

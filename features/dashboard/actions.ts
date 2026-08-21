"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  initialCancelWorkOrderState,
  type CancelWorkOrderState,
} from "@/features/dashboard/action-state";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const cancelWorkOrderSchema = z.object({
  workOrderId: z.string().min(1),
  reason: z.string().trim().min(3).max(2000),
});

export async function cancelWorkOrder(
  _previousState: CancelWorkOrderState,
  formData: FormData,
): Promise<CancelWorkOrderState> {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const parsed = cancelWorkOrderSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      error: "Enter a cancellation reason with at least 3 characters.",
      success: null,
    };
  }

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: parsed.data.workOrderId },
    select: { id: true, status: true, jobNumber: true },
  });

  if (!workOrder) {
    return { error: "This work order could not be found.", success: null };
  }

  if (workOrder.status === "CANCELLED") {
    return { error: "This work order is already cancelled.", success: null };
  }

  if (workOrder.status !== "OPEN" && workOrder.status !== "ASSIGNED") {
    return {
      error: "Only open or assigned work orders can be cancelled.",
      success: null,
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.workOrder.update({
        where: { id: workOrder.id },
        data: { status: "CANCELLED" },
      });

      await transaction.workOrderActivity.create({
        data: {
          workOrderId: workOrder.id,
          userId: session.user.id,
          action: "STATUS_CHANGED",
          fromValue: workOrder.status,
          toValue: "CANCELLED",
          notes: parsed.data.reason,
        },
      });
    });
  } catch {
    return {
      error: "The work order could not be cancelled. Please try again.",
      success: null,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/my-jobs");
  revalidatePath(`/work-orders/${workOrder.id}`);
  return {
    ...initialCancelWorkOrderState,
    success: `Job #WO-${workOrder.jobNumber.toString().padStart(4, "0")} was cancelled.`,
  };
}

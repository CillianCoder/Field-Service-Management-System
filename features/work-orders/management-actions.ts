"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  initialCreateWorkOrderState,
  type CreateWorkOrderState,
} from "@/features/work-orders/management-action-state";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const createWorkOrderSchema = z.object({
  title: z.string().trim().min(2, "Enter a job title.").max(160),
  description: z.string().trim().min(2, "Enter a job description.").max(5000),
  customerId: z.string().cuid("Select a valid customer."),
  technicianId: z.union([z.string().cuid(), z.literal("")]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  scheduledDate: z
    .string()
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Enter a valid scheduled date.",
    ),
});

export async function createWorkOrder(
  _previousState: CreateWorkOrderState,
  formData: FormData,
): Promise<CreateWorkOrderState> {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const parsed = createWorkOrderSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    customerId: formData.get("customerId"),
    technicianId: formData.get("technicianId"),
    priority: formData.get("priority"),
    scheduledDate: formData.get("scheduledDate"),
  });

  if (!parsed.success) {
    return {
      ...initialCreateWorkOrderState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const scheduledDate = new Date(parsed.data.scheduledDate);
  const technicianId = parsed.data.technicianId || null;

  const [customer, technician] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: parsed.data.customerId },
      select: { id: true },
    }),
    technicianId
      ? prisma.technician.findUnique({
          where: { id: technicianId },
          select: { id: true, status: true },
        })
      : null,
  ]);

  if (!customer) {
    return {
      ...initialCreateWorkOrderState,
      fieldErrors: { customerId: ["Select an existing customer."] },
    };
  }

  if (technicianId && !technician) {
    return {
      ...initialCreateWorkOrderState,
      fieldErrors: { technicianId: ["Select an existing technician."] },
    };
  }

  if (technician?.status === "OFFLINE") {
    return {
      ...initialCreateWorkOrderState,
      fieldErrors: {
        technicianId: ["Offline technicians cannot receive new assignments."],
      },
    };
  }

  try {
    const workOrder = await prisma.$transaction(async (transaction) => {
      const created = await transaction.workOrder.create({
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          customerId: parsed.data.customerId,
          technicianId,
          priority: parsed.data.priority,
          status: technicianId ? "ASSIGNED" : "OPEN",
          scheduledDate,
        },
        select: { id: true, status: true, jobNumber: true },
      });

      await transaction.workOrderActivity.create({
        data: {
          workOrderId: created.id,
          userId: session.user.id,
          action: "STATUS_CHANGED",
          fromValue: null,
          toValue: created.status,
          notes: technicianId ? "Work order created and assigned." : null,
        },
      });

      return created;
    });

    revalidatePath("/dashboard");
    revalidatePath("/work-orders");
    revalidatePath("/my-jobs");
    redirect(`/work-orders/${workOrder.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    return {
      ...initialCreateWorkOrderState,
      error: "The work order could not be created. Please try again.",
    };
  }
}

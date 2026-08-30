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
    )
    .refine((value) => {
      const t = new Date(value).getTime();
      return !Number.isNaN(t) && t >= Date.now();
    }, "Scheduled date must be in the future."),
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

  function parseLocalDateTime(value: string) {
    const m =
      /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?$/.exec(
        value,
      );
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);
    const second = Number(m[6] ?? "0");
    return new Date(year, month, day, hour, minute, second);
  }

  const scheduledDate = parseLocalDateTime(parsed.data.scheduledDate);
  const technicianId = parsed.data.technicianId || null;

  if (!scheduledDate) {
    return {
      ...initialCreateWorkOrderState,
      fieldErrors: { scheduledDate: ["Enter a valid scheduled date."] },
    };
  }

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

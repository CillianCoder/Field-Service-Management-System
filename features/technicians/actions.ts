"use server";

import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";

import type { TechnicianActionState } from "@/features/technicians/action-state";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import {
  createTechnicianSchema,
  updateTechnicianSchema,
} from "@/lib/validations/technician";

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    skills: formData.getAll("skills"),
    status: formData.get("status"),
  };
}

function validationState(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): TechnicianActionState {
  const fieldErrors = error.flatten().fieldErrors;
  return {
    error: "Review the highlighted fields and try again.",
    success: null,
    fieldErrors,
  } as TechnicianActionState;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "P2002";
}

export async function createTechnician(
  _previousState: TechnicianActionState,
  formData: FormData,
): Promise<TechnicianActionState> {
  await requireRole(["ADMIN", "DISPATCHER"]);
  const parsed = createTechnicianSchema.safeParse({
    ...getFormValues(formData),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const { password, ...technicianData } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    await prisma.$transaction(async (transaction) => {
      const userId = crypto.randomUUID();
      await transaction.user.create({
        data: {
          id: userId,
          name: technicianData.name,
          email: technicianData.email,
          role: "TECHNICIAN",
          emailVerified: false,
        },
      });
      await transaction.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: passwordHash,
        },
      });
      await transaction.technician.create({
        data: {
          userId,
          ...technicianData,
        },
      });
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return {
        error: "A user or technician with this email already exists.",
        success: null,
        fieldErrors: { email: ["Use a different email address."] },
      };
    }
    return {
      error: "The technician account could not be created. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }

  revalidatePath("/technicians");
  revalidatePath("/dashboard");
  return {
    error: null,
    success: "Technician account created successfully.",
    fieldErrors: {},
  };
}

export async function updateTechnician(
  _previousState: TechnicianActionState,
  formData: FormData,
): Promise<TechnicianActionState> {
  await requireRole(["ADMIN", "DISPATCHER"]);
  const parsed = updateTechnicianSchema.safeParse({
    id: formData.get("id"),
    ...getFormValues(formData),
    confirmOfflineConflict: formData.get("confirmOfflineConflict") === "true",
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const { id, confirmOfflineConflict, ...technicianData } = parsed.data;
  const current = await prisma.technician.findUnique({
    where: { id },
    select: {
      userId: true,
      workOrders: {
        where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        select: { status: true },
      },
    },
  });

  if (!current) {
    return { error: "Technician not found.", success: null, fieldErrors: {} };
  }

  if (
    technicianData.status === "OFFLINE" &&
    current.workOrders.length > 0 &&
    !confirmOfflineConflict
  ) {
    return {
      error:
        "Confirm that existing jobs will remain assigned before setting this technician offline.",
      success: null,
      fieldErrors: {
        status: ["This technician has active work that requires confirmation."],
      },
    };
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: current.userId },
        data: { name: technicianData.name, email: technicianData.email },
      }),
      prisma.technician.update({
        where: { id },
        data: technicianData,
      }),
    ]);
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return {
        error: "A user or technician with this email already exists.",
        success: null,
        fieldErrors: { email: ["Use a different email address."] },
      };
    }
    return {
      error: "The technician could not be updated. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }

  revalidatePath("/technicians");
  revalidatePath("/dashboard");
  return {
    error: null,
    success: "Technician updated successfully.",
    fieldErrors: {},
  };
}

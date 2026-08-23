"use server";

import { revalidatePath } from "next/cache";

import type { UserActionState } from "@/features/users/action-state";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { updateUserRoleSchema } from "@/lib/validations/user";

export async function updateUserRole(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = updateUserRoleSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: "Review the selected role and try again.",
      success: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, role } = parsed.data;
  if (id === session.user.id && role !== "ADMIN") {
    return {
      error: "You cannot remove your own Admin access.",
      success: null,
      fieldErrors: { role: ["Keep your own role as Admin."] },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, technician: { select: { id: true } } },
  });

  if (!user) {
    return { error: "User not found.", success: null, fieldErrors: {} };
  }

  if (role === "TECHNICIAN" && !user.technician) {
    return {
      error:
        "This user has no technician profile. Create the profile from the Technicians page first.",
      success: null,
      fieldErrors: { role: ["A technician profile is required."] },
    };
  }

  if (user.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return {
        error: "The system must keep at least one Admin account.",
        success: null,
        fieldErrors: { role: ["At least one Admin is required."] },
      };
    }
  }

  try {
    await prisma.user.update({ where: { id }, data: { role } });
  } catch {
    return {
      error: "The user role could not be updated. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }

  revalidatePath("/users");
  revalidatePath("/dashboard");
  return {
    error: null,
    success: "User role updated successfully.",
    fieldErrors: {},
  };
}

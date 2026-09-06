"use server";

import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { UserActionState } from "@/features/users/action-state";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { createUserSchema, updateUserRoleSchema } from "@/lib/validations/user";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "P2002";
}

function validationState(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): UserActionState {
  return {
    error: "Review the highlighted fields and try again.",
    success: null,
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function createUser(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireRole(["ADMIN"]);
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const { name, email, password, role } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    await prisma.$transaction(async (transaction) => {
      const userId = crypto.randomUUID();
      await transaction.user.create({
        data: {
          id: userId,
          name,
          email,
          role,
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
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return {
        error: "A user with this email already exists.",
        success: null,
        fieldErrors: { email: ["Use a different email address."] },
      };
    }
    return {
      error: "The user account could not be created. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }

  revalidatePath("/users");
  redirect("/users?created=1");
}

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

import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { getRoleDestination, isRole } from "@/lib/auth-roles";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function redirectAuthenticatedUser() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getRoleDestination(session.user.role));
  }
}

export async function requireRole(allowedRoles: readonly Role[]) {
  const session = await getCurrentSession();

  if (!session || !isRole(session.user.role)) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getRoleDestination(session.user.role));
  }

  return session;
}

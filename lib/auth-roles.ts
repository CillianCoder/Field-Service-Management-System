import type { Role } from "@/generated/prisma/enums";

export const ROLE_DESTINATIONS = {
  ADMIN: "/dashboard",
  DISPATCHER: "/dashboard",
  TECHNICIAN: "/my-jobs",
} satisfies Record<Role, string>;

export function isRole(value: unknown): value is Role {
  return value === "ADMIN" || value === "DISPATCHER" || value === "TECHNICIAN";
}

export function getRoleDestination(role: unknown) {
  return isRole(role) ? ROLE_DESTINATIONS[role] : "/login";
}

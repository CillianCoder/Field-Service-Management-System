import { z } from "zod";

export const USER_ROLES = ["ADMIN", "DISPATCHER", "TECHNICIAN"] as const;

export const STAFF_ROLES = ["ADMIN", "DISPATCHER"] as const;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254, "Use 254 characters or fewer."),
  password: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(128, "Use 128 characters or fewer."),
  role: z.enum(STAFF_ROLES, { error: "Select a valid role." }),
});

export type CreateUserField = "name" | "email" | "password" | "role";

export const updateUserRoleSchema = z.object({
  id: z.string().min(1, "Invalid user."),
  role: z.enum(USER_ROLES, { error: "Select a valid role." }),
});

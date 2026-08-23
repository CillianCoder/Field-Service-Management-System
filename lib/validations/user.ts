import { z } from "zod";

export const USER_ROLES = ["ADMIN", "DISPATCHER", "TECHNICIAN"] as const;

export const updateUserRoleSchema = z.object({
  id: z.string().min(1, "Invalid user."),
  role: z.enum(USER_ROLES, { error: "Select a valid role." }),
});

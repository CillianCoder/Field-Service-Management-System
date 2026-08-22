import { z } from "zod";

export const TECHNICIAN_SKILLS = [
  "Electrical",
  "Plumbing",
  "Heating & Cooling Systems",
  "Appliance Repair",
  "Networking",
  "Security Systems",
  "General Maintenance",
  "Installation",
  "Inspection",
  "Diagnostics",
] as const;

export const TECHNICIAN_STATUSES = ["AVAILABLE", "BUSY", "OFFLINE"] as const;

const baseTechnicianSchema = z.object({
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
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(40, "Use 40 characters or fewer."),
  skills: z
    .array(z.enum(TECHNICIAN_SKILLS))
    .min(1, "Select at least one skill."),
  status: z.enum(TECHNICIAN_STATUSES, { error: "Select a valid status." }),
});

export const createTechnicianSchema = baseTechnicianSchema.extend({
  password: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(128, "Use 128 characters or fewer."),
});

export const updateTechnicianSchema = baseTechnicianSchema.extend({
  id: z.string().cuid("Invalid technician."),
  confirmOfflineConflict: z.boolean(),
});

export type TechnicianField =
  "name" | "email" | "phone" | "skills" | "status" | "password";

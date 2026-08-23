import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(40),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters.")
    .max(240),
});

export type CustomerInput = z.infer<typeof customerSchema>;

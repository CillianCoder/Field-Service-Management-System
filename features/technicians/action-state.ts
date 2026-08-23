import type { TechnicianField } from "@/lib/validations/technician";

export type TechnicianActionState = {
  error: string | null;
  success: string | null;
  fieldErrors: Partial<Record<TechnicianField, string[]>>;
};

export const initialTechnicianActionState: TechnicianActionState = {
  error: null,
  success: null,
  fieldErrors: {},
};

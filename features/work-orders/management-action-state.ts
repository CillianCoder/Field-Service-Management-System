export type CreateWorkOrderState = Readonly<{
  error: string | null;
  fieldErrors: Partial<
    Record<
      | "title"
      | "description"
      | "customerId"
      | "scheduledDate"
      | "priority"
      | "technicianId",
      string[]
    >
  >;
}>;

export const initialCreateWorkOrderState: CreateWorkOrderState = {
  error: null,
  fieldErrors: {},
};

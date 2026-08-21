export type CancelWorkOrderState = Readonly<{
  error: string | null;
  success: string | null;
}>;

export const initialCancelWorkOrderState: CancelWorkOrderState = {
  error: null,
  success: null,
};

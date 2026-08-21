export type CustomerActionState = {
  error: string | null;
  success: string | null;
};

export const initialCustomerActionState: CustomerActionState = {
  error: null,
  success: null,
};

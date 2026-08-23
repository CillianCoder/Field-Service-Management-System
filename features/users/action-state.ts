export type UserActionState = {
  error: string | null;
  success: string | null;
  fieldErrors: Record<string, string[]>;
};

export const initialUserActionState: UserActionState = {
  error: null,
  success: null,
  fieldErrors: {},
};

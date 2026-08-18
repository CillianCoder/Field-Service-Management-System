export type JobActionState = Readonly<{
  error: string | null;
}>;

export const initialJobActionState: JobActionState = { error: null };

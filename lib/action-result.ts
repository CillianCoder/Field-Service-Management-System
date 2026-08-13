export type FieldErrorMap<TField extends string = string> = Partial<
  Record<TField, string[]>
>;

export type ActionResult<TData = undefined, TField extends string = string> =
  | { success: true; data: TData }
  | {
      success: false;
      message: string;
      fieldErrors?: FieldErrorMap<TField>;
    };

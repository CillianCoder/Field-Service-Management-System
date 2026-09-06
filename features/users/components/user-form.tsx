"use client";

import { useActionState, useState } from "react";

import { initialUserActionState } from "@/features/users/action-state";
import type { UserActionState } from "@/features/users/action-state";
import { createUser } from "@/features/users/actions";
import { STAFF_ROLES } from "@/lib/validations/user";

function FieldError({
  id,
  errors,
}: Readonly<{ id: string; errors?: string[] }>) {
  return errors?.[0] ? (
    <p className="text-error-text mt-1 text-sm" id={id}>
      {errors[0]}
    </p>
  ) : null;
}

function roleLabel(role: string) {
  return role[0] + role.slice(1).toLowerCase();
}

export function UserForm() {
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: "DISPATCHER" as (typeof STAFF_ROLES)[number],
  });
  const [state, formAction, isPending] = useActionState<
    UserActionState,
    FormData
  >(async (previousState, formData) => {
    return createUser(previousState, formData);
  }, initialUserActionState);

  function updateDraft<K extends keyof typeof draft>(
    field: K,
    value: (typeof draft)[K],
  ) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Name
          <input
            aria-describedby={
              state.fieldErrors.name ? "user-name-error" : undefined
            }
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="name"
            onChange={(event) => updateDraft("name", event.target.value)}
            placeholder="Jordan Smith"
            required
            value={draft.name}
          />
          <FieldError id="user-name-error" errors={state.fieldErrors.name} />
        </label>
        <label className="text-foreground text-sm font-medium">
          Email
          <input
            aria-describedby={
              state.fieldErrors.email ? "user-email-error" : undefined
            }
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="email"
            onChange={(event) => updateDraft("email", event.target.value)}
            placeholder="person@company.com"
            required
            type="email"
            value={draft.email}
          />
          <FieldError id="user-email-error" errors={state.fieldErrors.email} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Role
          <select
            aria-describedby={
              state.fieldErrors.role ? "user-role-error" : undefined
            }
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="role"
            onChange={(event) => {
              const value = event.target.value;
              if ((STAFF_ROLES as readonly string[]).includes(value)) {
                updateDraft("role", value as (typeof STAFF_ROLES)[number]);
              }
            }}
            value={draft.role}
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
          <FieldError id="user-role-error" errors={state.fieldErrors.role} />
        </label>
        <label className="text-foreground text-sm font-medium">
          Initial password
          <input
            aria-describedby="user-password-help user-password-error"
            autoComplete="new-password"
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="password"
            onChange={(event) => updateDraft("password", event.target.value)}
            required
            type="password"
            value={draft.password}
          />
          <span
            className="text-muted mt-1 block text-xs"
            id="user-password-help"
          >
            Use at least 12 characters. Secure delivery and forced password
            change will be added later.
          </span>
          <FieldError
            id="user-password-error"
            errors={state.fieldErrors.password}
          />
        </label>
      </div>

      {state.error ? (
        <p className="text-error-text text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        className="bg-accent hover:bg-accent-hover h-11 px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Creating..." : "Create user"}
      </button>
    </form>
  );
}

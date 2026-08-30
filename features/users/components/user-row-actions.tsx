"use client";

import { Pencil, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import {
  initialUserActionState,
  type UserActionState,
} from "@/features/users/action-state";
import { updateUserRole } from "@/features/users/actions";
import { USER_ROLES } from "@/lib/validations/user";

type UserRecord = Readonly<{
  id: string;
  name: string;
  email: string;
  role: (typeof USER_ROLES)[number];
}>;

function roleLabel(role: string) {
  return role[0] + role.slice(1).toLowerCase();
}

export function UserRowActions({ user }: { user: UserRecord }) {
  const [editing, setEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [state, formAction, isPending] = useActionState<
    UserActionState,
    FormData
  >(async (previousState, formData) => {
    const result = await updateUserRole(previousState, formData);
    if (result.success) setEditing(false);
    return result;
  }, initialUserActionState);

  useEffect(() => {
    if (!editing) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [editing]);

  return (
    <>
      <button
        aria-label={`Edit ${user.name}`}
        className="text-accent hover:text-accent-hover inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"
        onClick={() => setEditing(true)}
        type="button"
      >
        <Pencil aria-hidden="true" className="size-4" />
        Edit role
      </button>
      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setEditing(false)}
          role="presentation"
        >
          <div
            aria-labelledby={`${user.id}-edit-title`}
            aria-modal="true"
            className="border-border bg-panel w-full max-w-lg border p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-accent text-sm font-semibold">Edit user</p>
                <h2
                  className="text-foreground mt-1 text-xl font-semibold"
                  id={`${user.id}-edit-title`}
                >
                  {user.name}
                </h2>
                <p className="text-muted mt-1 text-sm">{user.email}</p>
              </div>
              <button
                aria-label="Close edit dialog"
                className="text-muted hover:text-foreground inline-flex h-11 w-11 items-center justify-center"
                onClick={() => setEditing(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <form action={formAction} className="mt-5 space-y-4">
              <input name="id" type="hidden" value={user.id} />
              <label className="text-foreground block text-sm font-medium">
                Role
                <select
                  className="border-input bg-panel focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
                  name="role"
                  onChange={(event) => {
                    const value = event.target.value;
                    if ((USER_ROLES as readonly string[]).includes(value)) {
                      setSelectedRole(value as (typeof USER_ROLES)[number]);
                    }
                  }}
                  value={selectedRole}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
              </label>
              {state.fieldErrors.role?.[0] ? (
                <p className="text-error-text text-sm">
                  {state.fieldErrors.role[0]}
                </p>
              ) : null}
              {state.error ? (
                <p className="text-error-text text-sm" role="alert">
                  {state.error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-accent hover:bg-accent-hover h-11 px-5 text-sm font-semibold text-white disabled:opacity-70"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Saving..." : "Save role"}
                </button>
                <button
                  className="border-border text-foreground hover:bg-surface h-11 border px-5 text-sm font-semibold"
                  onClick={() => setEditing(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useActionState, useState } from "react";

import { initialTechnicianActionState } from "@/features/technicians/action-state";
import type { TechnicianActionState } from "@/features/technicians/action-state";
import {
  createTechnician,
  updateTechnician,
} from "@/features/technicians/actions";
import {
  TECHNICIAN_SKILLS,
  TECHNICIAN_STATUSES,
} from "@/lib/validations/technician";

export type TechnicianFormRecord = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  status: (typeof TECHNICIAN_STATUSES)[number];
  assignedJobs: number;
  inProgressJobs: number;
}>;

type TechnicianFormProps = Readonly<{
  technician?: TechnicianFormRecord;
  onCancel?: () => void;
  onSuccess?: () => void;
}>;

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

function statusLabel(status: string) {
  return status[0] + status.slice(1).toLowerCase();
}

export function TechnicianForm({
  technician,
  onCancel,
  onSuccess,
}: TechnicianFormProps) {
  const [selectedStatus, setSelectedStatus] = useState(
    technician?.status ?? "AVAILABLE",
  );
  const [state, formAction, isPending] = useActionState<
    TechnicianActionState,
    FormData
  >(async (previousState, formData) => {
    const result = technician
      ? await updateTechnician(previousState, formData)
      : await createTechnician(previousState, formData);
    if (result.success) {
      onSuccess?.();
    }
    return result;
  }, initialTechnicianActionState);
  const activeJobs =
    (technician?.assignedJobs ?? 0) + (technician?.inProgressJobs ?? 0);
  const showOfflineWarning = Boolean(
    technician && selectedStatus === "OFFLINE" && activeJobs > 0,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {technician ? (
        <input name="id" type="hidden" value={technician.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Name
          <input
            aria-describedby={
              state.fieldErrors.name ? "technician-name-error" : undefined
            }
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={technician?.name}
            name="name"
            placeholder="Alex Morgan"
            required
          />
          <FieldError
            id="technician-name-error"
            errors={state.fieldErrors.name}
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Email
          <input
            aria-describedby={
              state.fieldErrors.email ? "technician-email-error" : undefined
            }
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={technician?.email}
            name="email"
            placeholder="technician@company.com"
            required
            type="email"
          />
          <FieldError
            id="technician-email-error"
            errors={state.fieldErrors.email}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Phone
          <input
            aria-describedby={
              state.fieldErrors.phone ? "technician-phone-error" : undefined
            }
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={technician?.phone}
            name="phone"
            placeholder="+1 555 010 2000"
            required
            type="tel"
          />
          <FieldError
            id="technician-phone-error"
            errors={state.fieldErrors.phone}
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Status
          <select
            aria-describedby={
              state.fieldErrors.status ? "technician-status-error" : undefined
            }
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={technician?.status ?? "AVAILABLE"}
            name="status"
            onChange={(event) => {
              const value = event.target.value;
              if ((TECHNICIAN_STATUSES as readonly string[]).includes(value)) {
                setSelectedStatus(
                  value as (typeof TECHNICIAN_STATUSES)[number],
                );
              }
            }}
          >
            {TECHNICIAN_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <FieldError
            id="technician-status-error"
            errors={state.fieldErrors.status}
          />
        </label>
      </div>

      {!technician ? (
        <label className="text-foreground block text-sm font-medium">
          Initial password
          <input
            aria-describedby="technician-password-help technician-password-error"
            autoComplete="new-password"
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="password"
            required
            type="password"
          />
          <span
            className="text-muted mt-1 block text-xs"
            id="technician-password-help"
          >
            Use at least 12 characters. Secure delivery and forced password
            change will be added later.
          </span>
          <FieldError
            id="technician-password-error"
            errors={state.fieldErrors.password}
          />
        </label>
      ) : null}

      <fieldset
        aria-describedby={
          state.fieldErrors.skills ? "technician-skills-error" : undefined
        }
      >
        <legend className="text-foreground text-sm font-medium">Skills</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TECHNICIAN_SKILLS.map((skill) => (
            <label
              className="border-border hover:border-input flex min-h-11 cursor-pointer items-center gap-3 border px-3 text-sm"
              key={skill}
            >
              <input
                defaultChecked={technician?.skills.includes(skill)}
                name="skills"
                type="checkbox"
                value={skill}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
        <FieldError
          id="technician-skills-error"
          errors={state.fieldErrors.skills}
        />
      </fieldset>

      {showOfflineWarning ? (
        <div className="border-error-border bg-error-subtle p-4">
          <p className="text-error-text text-sm font-semibold">
            Existing work will remain assigned
          </p>
          <p className="text-error-text mt-1 text-sm">
            This technician has {technician?.assignedJobs} assigned and{" "}
            {technician?.inProgressJobs} in-progress job
            {activeJobs === 1 ? "" : "s"}. Setting Offline prevents new
            assignments but does not change these jobs.
          </p>
          <label className="text-error-text mt-3 flex min-h-11 items-center gap-3 text-sm font-medium">
            <input
              name="confirmOfflineConflict"
              required
              type="checkbox"
              value="true"
            />
            I understand and want to set this technician offline.
          </label>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-error-text text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-muted text-sm" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className="bg-accent hover:bg-accent-hover h-11 px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? "Saving..."
            : technician
              ? "Save changes"
              : "Create technician"}
        </button>
        {technician && onCancel ? (
          <button
            className="border-border text-foreground hover:bg-surface h-11 border px-5 text-sm font-semibold"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

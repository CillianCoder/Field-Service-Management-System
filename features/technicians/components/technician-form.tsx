"use client";

import { useActionState, useState, useEffect, useRef } from "react";

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

type TechnicianDraft = {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: (typeof TECHNICIAN_STATUSES)[number];
  skills: string[];
};

const EMPTY_DRAFT: TechnicianDraft = {
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "AVAILABLE",
  skills: [],
};

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
  const [draft, setDraft] = useState<TechnicianDraft>(() =>
    technician
      ? {
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
          password: "",
          status: technician.status,
          skills: technician.skills,
        }
      : EMPTY_DRAFT,
  );
  const [state, formAction, isPending] = useActionState<
    TechnicianActionState,
    FormData
  >(async (previousState, formData) => {
    const result = technician
      ? await updateTechnician(previousState, formData)
      : await createTechnician(previousState, formData);
    if (result.success) {
      if (!technician) {
        setDraft(EMPTY_DRAFT);
      }
      onSuccess?.();
    }
    return result;
  }, initialTechnicianActionState);

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="skills"][type="checkbox"]',
      ),
    );

    for (const input of inputs) {
      const shouldBeChecked = draft.skills.includes(input.value);
      if (input.checked !== shouldBeChecked) {
        input.checked = shouldBeChecked;
      }
      // Keep React's internal tracker in sync if present
      try {
        const tracker = (
          input as unknown as {
            _valueTracker?: { setValue?: (v: string) => void };
          }
        )._valueTracker;
        if (tracker && typeof tracker.setValue === "function") {
          tracker.setValue(shouldBeChecked ? "true" : "false");
        }
      } catch {
        // ignore tracker sync failures
      }
    }
  }, [draft.skills, state]);

  function updateDraft<K extends keyof TechnicianDraft>(
    field: K,
    value: TechnicianDraft[K],
  ) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  const activeJobs =
    (technician?.assignedJobs ?? 0) + (technician?.inProgressJobs ?? 0);
  const showOfflineWarning = Boolean(
    technician && draft.status === "OFFLINE" && activeJobs > 0,
  );
  const showBusyInfo = Boolean(
    technician && draft.status === "BUSY" && activeJobs > 0,
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
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
            name="name"
            onChange={(event) => updateDraft("name", event.target.value)}
            placeholder="Alex Morgan"
            required
            value={draft.name}
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
            name="email"
            onChange={(event) => updateDraft("email", event.target.value)}
            placeholder="technician@company.com"
            required
            type="email"
            value={draft.email}
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
            name="phone"
            onChange={(event) => updateDraft("phone", event.target.value)}
            placeholder="+1 555 010 2000"
            required
            type="tel"
            value={draft.phone}
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
            name="status"
            onChange={(event) => {
              const value = event.target.value;
              if ((TECHNICIAN_STATUSES as readonly string[]).includes(value)) {
                updateDraft(
                  "status",
                  value as (typeof TECHNICIAN_STATUSES)[number],
                );
              }
            }}
            value={draft.status}
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
            onChange={(event) => updateDraft("password", event.target.value)}
            required
            type="password"
            value={draft.password}
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
                checked={draft.skills.includes(skill)}
                name="skills"
                onChange={(event) => {
                  updateDraft(
                    "skills",
                    event.target.checked
                      ? [...draft.skills, skill]
                      : draft.skills.filter((s) => s !== skill),
                  );
                }}
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

      {showBusyInfo ? (
        <div className="border-border bg-surface p-4">
          <p className="text-foreground text-sm font-semibold">
            This technician already has active work
          </p>
          <p className="text-muted mt-1 text-sm">
            There are {technician?.assignedJobs} assigned and{" "}
            {technician?.inProgressJobs} in-progress job
            {activeJobs === 1 ? "" : "s"}. Setting Busy will not change these
            existing assignments.
          </p>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-error-text text-sm" role="alert">
          {state.error}
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
        {onCancel ? (
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

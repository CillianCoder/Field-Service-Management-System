"use client";

import { useActionState, useEffect, useState } from "react";

import { createWorkOrder } from "@/features/work-orders/management-actions";
import {
  initialCreateWorkOrderState,
  type CreateWorkOrderState,
} from "@/features/work-orders/management-action-state";

type WorkOrderCreationFormProps = Readonly<{
  customers: ReadonlyArray<{ id: string; name: string }>;
  technicians: ReadonlyArray<{
    id: string;
    name: string;
    status: "AVAILABLE" | "BUSY" | "OFFLINE";
  }>;
}>;

type WorkOrderDraft = {
  title: string;
  customerId: string;
  description: string;
  scheduledDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  technicianId: string;
};

const EMPTY_DRAFT: WorkOrderDraft = {
  title: "",
  customerId: "",
  description: "",
  scheduledDate: "",
  priority: "MEDIUM",
  technicianId: "",
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

export function WorkOrderCreationForm({
  customers,
  technicians,
}: WorkOrderCreationFormProps) {
  const [draft, setDraft] = useState<WorkOrderDraft>(EMPTY_DRAFT);
  const [minScheduledDate, setMinScheduledDate] = useState("");
  const [scheduledDateClientError, setScheduledDateClientError] = useState("");
  const [state, formAction, isPending] = useActionState<
    CreateWorkOrderState,
    FormData
  >(createWorkOrder, initialCreateWorkOrderState);

  function updateDraft<K extends keyof WorkOrderDraft>(
    field: K,
    value: WorkOrderDraft[K],
  ) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setMinScheduledDate(local);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!draft.scheduledDate) return; // let required/browser handle empty
    const t = new Date(draft.scheduledDate).getTime();
    if (Number.isNaN(t) || t < Date.now()) {
      event.preventDefault();
      setScheduledDateClientError("Scheduled date must be in the future.");
    }
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Job title
          <input
            aria-describedby={
              state.fieldErrors.title ? "title-error" : undefined
            }
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="title"
            onChange={(event) => updateDraft("title", event.target.value)}
            placeholder="Replace rooftop HVAC unit"
            required
            value={draft.title}
          />
          <FieldError errors={state.fieldErrors.title} id="title-error" />
        </label>
        <label className="text-foreground text-sm font-medium">
          Customer
          <select
            aria-describedby={
              state.fieldErrors.customerId ? "customer-error" : undefined
            }
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="customerId"
            onChange={(event) => updateDraft("customerId", event.target.value)}
            required
            value={draft.customerId}
          >
            <option disabled value="">
              Select customer
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <FieldError
            errors={state.fieldErrors.customerId}
            id="customer-error"
          />
        </label>
      </div>

      <label className="text-foreground block text-sm font-medium">
        Description
        <textarea
          aria-describedby={
            state.fieldErrors.description ? "description-error" : undefined
          }
          className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 min-h-32 w-full resize-y border p-3 text-sm focus:outline-none"
          name="description"
          onChange={(event) => updateDraft("description", event.target.value)}
          placeholder="Describe the issue, requested work, and site requirements."
          required
          value={draft.description}
        />
        <FieldError
          errors={state.fieldErrors.description}
          id="description-error"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-foreground text-sm font-medium">
          Scheduled date
          <input
            aria-describedby={
              state.fieldErrors.scheduledDate ? "scheduled-error" : undefined
            }
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="scheduledDate"
            onChange={(event) => {
              const v = event.target.value;
              updateDraft("scheduledDate", v);
              const t = new Date(v).getTime();
              if (!v || Number.isNaN(t) || t < Date.now()) {
                setScheduledDateClientError(
                  "Scheduled date must be in the future.",
                );
              } else {
                setScheduledDateClientError("");
              }
            }}
            required
            type="datetime-local"
            min={minScheduledDate || undefined}
            value={draft.scheduledDate}
          />
          <FieldError
            errors={
              scheduledDateClientError
                ? [scheduledDateClientError]
                : state.fieldErrors.scheduledDate
            }
            id="scheduled-error"
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Priority
          <select
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="priority"
            onChange={(event) => {
              const value = event.target.value;
              if (
                (["LOW", "MEDIUM", "HIGH", "URGENT"] as string[]).includes(
                  value,
                )
              ) {
                updateDraft("priority", value as WorkOrderDraft["priority"]);
              }
            }}
            value={draft.priority}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>
        <label className="text-foreground text-sm font-medium">
          Assign technician
          <select
            aria-describedby={
              state.fieldErrors.technicianId ? "technician-error" : undefined
            }
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="technicianId"
            onChange={(event) =>
              updateDraft("technicianId", event.target.value)
            }
            value={draft.technicianId}
          >
            <option value="">Leave unassigned</option>
            {technicians.map((technician) => (
              <option
                disabled={technician.status === "OFFLINE"}
                key={technician.id}
                value={technician.id}
              >
                {technician.name} ({statusLabel(technician.status)})
              </option>
            ))}
          </select>
          <FieldError
            errors={state.fieldErrors.technicianId}
            id="technician-error"
          />
        </label>
      </div>

      {state.error ? (
        <p className="text-error-text text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        className="bg-accent hover:bg-accent-hover min-h-11 px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending || customers.length === 0}
        type="submit"
      >
        {isPending ? "Creating work order..." : "Create work order"}
      </button>
      {customers.length === 0 ? (
        <p className="text-error-text text-sm" role="alert">
          Create a customer before creating a work order.
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { useActionState } from "react";

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
  const [state, formAction, isPending] = useActionState<
    CreateWorkOrderState,
    FormData
  >(createWorkOrder, initialCreateWorkOrderState);

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
            placeholder="Replace rooftop HVAC unit"
            required
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
            defaultValue=""
            name="customerId"
            required
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
          placeholder="Describe the issue, requested work, and site requirements."
          required
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
            required
            type="datetime-local"
          />
          <FieldError
            errors={state.fieldErrors.scheduledDate}
            id="scheduled-error"
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Priority
          <select
            className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue="MEDIUM"
            name="priority"
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
            defaultValue=""
            name="technicianId"
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

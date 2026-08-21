"use client";

import { useActionState } from "react";

import {
  initialCancelWorkOrderState,
  type CancelWorkOrderState,
} from "@/features/dashboard/action-state";
import { cancelWorkOrder } from "@/features/dashboard/actions";

type CancelWorkOrderFormProps = Readonly<{
  workOrderId: string;
}>;

export function CancelWorkOrderForm({ workOrderId }: CancelWorkOrderFormProps) {
  const [state, formAction, isPending] = useActionState<
    CancelWorkOrderState,
    FormData
  >(cancelWorkOrder, initialCancelWorkOrderState);

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(event) => {
        if (!window.confirm("Cancel this work order? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input name="workOrderId" type="hidden" value={workOrderId} />
      <label
        className="text-foreground block text-sm font-medium"
        htmlFor={`reason-${workOrderId}`}
      >
        Cancellation reason
        <textarea
          className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 min-h-28 w-full resize-y border p-3 text-sm focus:outline-none"
          id={`reason-${workOrderId}`}
          name="reason"
          placeholder="Why is this job being cancelled?"
          required
        />
      </label>
      <button
        className="border-border bg-panel text-foreground hover:bg-surface min-h-11 border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Cancelling..." : "Confirm cancellation"}
      </button>
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
    </form>
  );
}

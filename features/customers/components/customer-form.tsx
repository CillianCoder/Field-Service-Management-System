"use client";

import { useActionState, useEffect } from "react";

import { saveCustomer } from "@/features/customers/actions";
import {
  initialCustomerActionState,
  type CustomerActionState,
} from "@/features/customers/action-state";

type CustomerFormProps = Readonly<{
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  submitLabel?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}>;

function submitLabel(customer?: CustomerFormProps["customer"]) {
  return customer ? "Update customer" : "Create customer";
}

export function CustomerForm({
  customer,
  submitLabel: submitLabelOverride,
  onCancel,
  onSuccess,
}: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState<
    CustomerActionState,
    FormData
  >(saveCustomer, initialCustomerActionState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [onSuccess, state.success]);

  return (
    <form className="space-y-4" action={formAction} noValidate>
      {customer ? <input name="id" type="hidden" value={customer.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Name
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={customer?.name}
            name="name"
            placeholder="Northwind Office Park"
            required
            type="text"
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Email
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={customer?.email}
            name="email"
            placeholder="customer@company.com"
            required
            type="email"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Phone
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={customer?.phone}
            name="phone"
            placeholder="+1 555 010 3001"
            required
            type="tel"
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Address
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            defaultValue={customer?.address}
            name="address"
            placeholder="1200 Market Street, Springfield"
            required
            type="text"
          />
        </label>
      </div>

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
          {submitLabelOverride ?? submitLabel(customer)}
        </button>
        {customer && onCancel ? (
          <button
            className="border-border text-foreground hover:bg-surface h-11 border px-5 text-sm font-semibold transition-colors"
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

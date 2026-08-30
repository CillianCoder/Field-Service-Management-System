"use client";

import { useActionState, useState } from "react";

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

type CustomerDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const EMPTY_DRAFT: CustomerDraft = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

function submitLabel(customer?: CustomerFormProps["customer"]) {
  return customer ? "Update customer" : "Create customer";
}

export function CustomerForm({
  customer,
  submitLabel: submitLabelOverride,
  onCancel,
  onSuccess,
}: CustomerFormProps) {
  const [draft, setDraft] = useState<CustomerDraft>(() =>
    customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        }
      : EMPTY_DRAFT,
  );
  const [state, formAction, isPending] = useActionState<
    CustomerActionState,
    FormData
  >(async (previousState, formData) => {
    const result = await saveCustomer(previousState, formData);
    if (result.success) {
      if (!customer) {
        setDraft(EMPTY_DRAFT);
      }
      onSuccess?.();
    }
    return result;
  }, initialCustomerActionState);

  function updateDraft<K extends keyof CustomerDraft>(
    field: K,
    value: CustomerDraft[K],
  ) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <form className="space-y-4" action={formAction} noValidate>
      {customer ? <input name="id" type="hidden" value={customer.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Name
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="name"
            onChange={(event) => updateDraft("name", event.target.value)}
            placeholder="Northwind Office Park"
            required
            type="text"
            value={draft.name}
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Email
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="email"
            onChange={(event) => updateDraft("email", event.target.value)}
            placeholder="customer@company.com"
            required
            type="email"
            value={draft.email}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-foreground text-sm font-medium">
          Phone
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="phone"
            onChange={(event) => updateDraft("phone", event.target.value)}
            placeholder="+1 555 010 3001"
            required
            type="tel"
            value={draft.phone}
          />
        </label>
        <label className="text-foreground text-sm font-medium">
          Address
          <input
            className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
            name="address"
            onChange={(event) => updateDraft("address", event.target.value)}
            placeholder="1200 Market Street, Springfield"
            required
            type="text"
            value={draft.address}
          />
        </label>
      </div>

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
          {submitLabelOverride ?? submitLabel(customer)}
        </button>
        {onCancel ? (
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

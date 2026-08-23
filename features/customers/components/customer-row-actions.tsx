"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { deleteCustomer } from "@/features/customers/actions";
import {
  initialCustomerActionState,
  type CustomerActionState,
} from "@/features/customers/action-state";
import { CustomerForm } from "@/features/customers/components/customer-form";

type CustomerRecord = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  _count: { workOrders: number };
}>;

export function CustomerRowActions({ customer }: { customer: CustomerRecord }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState<
    CustomerActionState,
    FormData
  >(async (previousState, formData) => {
    const result = await deleteCustomer(previousState, formData);
    if (result.success) {
      setEditing(false);
    }
    return result;
  }, initialCustomerActionState);

  useEffect(() => {
    if (!editing) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditing(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [editing]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button
          aria-label={`Edit ${customer.name}`}
          className="text-accent hover:text-accent-hover inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"
          onClick={() => setEditing(true)}
          type="button"
        >
          <Pencil aria-hidden="true" className="size-4" />
          Edit
        </button>
        {customer._count.workOrders === 0 ? (
          <form
            action={formAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Delete ${customer.name}? This cannot be undone.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input name="id" type="hidden" value={customer.id} />
            <button
              className="text-error-text inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </button>
          </form>
        ) : null}
      </div>

      {editing ? (
        <div
          aria-hidden="false"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setEditing(false)}
          role="presentation"
        >
          <div
            aria-labelledby={`${customer.id}-edit-title`}
            aria-modal="true"
            className="border-border bg-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto border p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-accent text-sm font-semibold">
                  Edit customer
                </p>
                <h2
                  className="text-foreground mt-1 text-xl font-semibold"
                  id={`${customer.id}-edit-title`}
                >
                  {customer.name}
                </h2>
              </div>
              <button
                aria-label="Close edit dialog"
                className="text-muted hover:text-foreground inline-flex h-10 w-10 items-center justify-center"
                onClick={() => setEditing(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="mt-5">
              <CustomerForm
                customer={customer}
                submitLabel="Save changes"
                onCancel={() => setEditing(false)}
                onSuccess={() => setEditing(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-error-text max-w-56 text-xs" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-muted text-xs" role="status">
          {state.success}
        </p>
      ) : null}
    </>
  );
}

import { Search } from "lucide-react";
import { Suspense } from "react";

import { AppHeader } from "@/components/layout/app-header";
import FiltersFormClient from "@/components/dashboard/FiltersFormClient";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { CustomerRowActions } from "@/features/customers/components/customer-row-actions";
import { getCustomers } from "@/features/customers/queries";
import { requireRole } from "@/lib/auth-session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers | FieldFlow",
};

type CustomersPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

type CustomersContentProps = CustomersPageProps &
  Readonly<{
    role: "ADMIN" | "DISPATCHER";
  }>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

function CustomerTable({
  customers,
}: {
  customers: Awaited<ReturnType<typeof getCustomers>>;
}) {
  return customers.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left text-sm">
        <thead className="text-muted text-xs tracking-wide uppercase">
          <tr>
            {[
              "Name",
              "Email",
              "Phone",
              "Address",
              "Work orders",
              "Actions",
            ].map((heading) => (
              <th
                className="border-border border-b px-3 py-3 font-semibold first:pl-0 last:pr-0"
                key={heading}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr className="text-foreground align-top" key={customer.id}>
              <td className="border-border border-b px-3 py-4 pl-0 font-medium">
                {customer.name}
              </td>
              <td className="text-muted border-border border-b px-3 py-4">
                {customer.email}
              </td>
              <td className="text-muted border-border border-b px-3 py-4">
                {customer.phone}
              </td>
              <td className="text-muted border-border border-b px-3 py-4">
                {customer.address}
              </td>
              <td className="border-border border-b px-3 py-4">
                {customer._count.workOrders}
              </td>
              <td className="border-border border-b px-3 py-4 pr-0">
                <CustomerRowActions customer={customer} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;
}

async function CustomersContent({ searchParams, role }: CustomersContentProps) {
  const params = await searchParams;
  const search = firstValue(params.search);
  const customers = await getCustomers(search);
  const created = Array.isArray(params.created)
    ? params.created[0]
    : params.created;

  return (
    <main className="bg-background min-h-screen">
      <AppHeader role={role} />
      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <div className="border-border flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wider uppercase">
              Management
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Customers
            </h1>
            <p className="text-muted mt-2 text-sm">
              Search, review, and manage customer records.
            </p>
          </div>
          {created === "1" ? (
            <p
              className="bg-success-subtle border-success-border text-success-text mt-4 flex items-center gap-2 border px-4 py-3 text-sm font-medium"
              role="status"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ✓
              </span>
              Customer created successfully.
            </p>
          ) : null}
        </div>

        <section
          aria-labelledby="create-customer-title"
          className="border-border mt-6 border-b pb-6"
        >
          <div className="mb-5">
            <h2
              className="text-foreground text-xl font-semibold"
              id="create-customer-title"
            >
              Create customer
            </h2>
            <p className="text-muted mt-1 text-sm">
              Add a customer record for service jobs.
            </p>
          </div>
          <div className="max-w-3xl">
            <CustomerForm key={created === "1" ? "created" : "fresh"} />
          </div>
        </section>

        <section className="border-border bg-panel mt-6 border p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Search
                aria-hidden="true"
                className="text-muted pointer-events-none size-4 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <FiltersFormClient action="/customers" initialSearch={search} />
              </div>
            </div>
            <div className="text-muted text-sm" aria-live="polite">
              {customers.length} result{customers.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-5">
            {customers.length > 0 ? (
              <CustomerTable customers={customers} />
            ) : (
              <div className="border-border border border-dashed px-6 py-12 text-center">
                <p className="text-foreground text-sm font-semibold">
                  {search
                    ? "No customers match this search"
                    : "No customers yet"}
                </p>
                <p className="text-muted mt-2 text-sm">
                  {search
                    ? "Try a different name, email, phone, or address."
                    : "Create the first customer record using the form above."}
                </p>
              </div>
            )}
          </div>

          {/* banner moved to header for visibility */}
        </section>
      </div>
    </main>
  );
}

export default async function CustomersPage(props: CustomersPageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  return (
    <Suspense
      fallback={<div className="text-muted p-8">Loading customers…</div>}
    >
      <CustomersContent
        {...props}
        role={session.user.role === "ADMIN" ? "ADMIN" : "DISPATCHER"}
      />
    </Suspense>
  );
}

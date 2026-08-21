import { Plus, Search } from "lucide-react";
import { Suspense } from "react";

import { AppHeader } from "@/components/layout/app-header";
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

async function CustomersContent({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const search = firstValue(params.search);
  const customers = await getCustomers(search);

  return (
    <main className="bg-background min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-accent text-sm font-semibold">
              Admin / Dispatcher
            </p>
            <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
              Customers
            </h1>
            <p className="text-muted mt-2 text-sm">
              Search, review, and manage customer records.
            </p>
          </div>
        </div>

        <section className="border-border bg-panel mt-8 border p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form className="grid gap-3 lg:flex lg:items-end" method="get">
              <label className="text-foreground text-sm font-medium">
                Search customers
                <span className="relative mt-2 block">
                  <Search
                    aria-hidden="true"
                    className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  />
                  <input
                    className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent h-11 w-full min-w-[280px] border px-3 pl-9 text-sm focus:outline-none"
                    defaultValue={search}
                    name="search"
                    placeholder="Name, email, phone, or address"
                  />
                </span>
              </label>
              <button
                className="bg-accent hover:bg-accent-hover h-11 px-5 text-sm font-semibold text-white transition-colors"
                type="submit"
              >
                Filter
              </button>
              {search ? (
                <a
                  className="text-muted hover:text-foreground inline-flex h-11 items-center px-2 text-sm font-semibold hover:underline"
                  href="/customers"
                >
                  Clear
                </a>
              ) : null}
            </form>
            <div className="text-muted text-sm" aria-live="polite">
              {customers.length} result{customers.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-6">
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
                    : "Create the first customer record below."}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-border bg-panel mt-8 border p-5">
          <div className="flex items-center gap-3">
            <Plus aria-hidden="true" className="size-4" />
            <h2 className="text-foreground text-lg font-semibold">
              Create customer
            </h2>
          </div>
          <div className="mt-5 max-w-3xl">
            <CustomerForm />
          </div>
        </section>
      </div>
    </main>
  );
}

export default async function CustomersPage(props: CustomersPageProps) {
  await requireRole(["ADMIN", "DISPATCHER"]);
  return (
    <Suspense
      fallback={<div className="text-muted p-8">Loading customers...</div>}
    >
      <CustomersContent {...props} />
    </Suspense>
  );
}

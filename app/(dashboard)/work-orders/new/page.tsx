import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { WorkOrderCreationForm } from "@/features/work-orders/components/work-order-creation-form";
import { getWorkOrderCreationOptions } from "@/features/work-orders/management-query";
import { requireRole } from "@/lib/auth-session";
import { isRole } from "@/lib/auth-roles";

export const metadata: Metadata = { title: "New work order | FieldFlow" };

export default async function NewWorkOrderPage() {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const role = isRole(session.user.role) ? session.user.role : "DISPATCHER";
  const { customers, technicians } = await getWorkOrderCreationOptions();

  return (
    <main className="bg-background min-h-screen">
      <AppHeader role={role} />
      <div className="mx-auto max-w-4xl px-4 py-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <header className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
              Operations
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              New work order
            </h1>
            <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
              Create a customer job and optionally assign an available or busy
              technician.
            </p>
          </div>
          <Link
            className="border-border text-foreground hover:bg-surface inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border px-4 text-sm font-semibold"
            href="/work-orders"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to work orders
          </Link>
        </header>

        <section className="border-border bg-panel mt-8 border p-5 sm:p-6">
          <WorkOrderCreationForm
            customers={customers}
            technicians={technicians}
          />
        </section>
      </div>
    </main>
  );
}

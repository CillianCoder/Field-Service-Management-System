import type { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import FiltersFormClient from "@/components/dashboard/FiltersFormClient";
import {
  getWorkOrderManagementData,
  parseWorkOrderManagementFilters,
  type WorkOrderManagementFilters,
} from "@/features/work-orders/management-query";
import { requireRole } from "@/lib/auth-session";
import { isRole } from "@/lib/auth-roles";

export const metadata: Metadata = { title: "Work orders | FieldFlow" };

type WorkOrdersPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const statusLabels = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} as const;

function formatJobReference(jobNumber: number) {
  return `WO-${jobNumber.toString().padStart(4, "0")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function workOrdersHref(
  filters: WorkOrderManagementFilters,
  overrides: Partial<Record<keyof WorkOrderManagementFilters, string>>,
) {
  const params = new URLSearchParams({
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    sort: filters.sort,
    page: filters.page.toString(),
    ...overrides,
  });
  return `/work-orders?${params.toString()}`;
}

export default async function WorkOrdersPage({
  searchParams,
}: WorkOrdersPageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const role = isRole(session.user.role) ? session.user.role : "DISPATCHER";
  const filters = parseWorkOrderManagementFilters(await searchParams);
  const { workOrders, pagination } = await getWorkOrderManagementData(filters);
  const isFiltered = Boolean(
    filters.search ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.sort !== "SOONEST",
  );

  return (
    <main className="bg-background min-h-screen">
      <AppHeader role={role} />
      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <header className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
              Operations
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Work orders
            </h1>
            <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
              Review service jobs, track assignment status, and open job
              details.
            </p>
          </div>
          <Link
            className="bg-accent hover:bg-accent-hover inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold text-white transition-colors"
            href="/work-orders/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            New work order
          </Link>
        </header>

        <section className="border-border bg-panel mt-8 border p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-foreground text-base font-semibold">
                Work order directory
              </h2>
              <p aria-live="polite" className="text-muted mt-1 text-sm">
                {pagination.total} work order
                {pagination.total === 1 ? "" : "s"} found
              </p>
            </div>
            <FiltersFormClient
              action="/work-orders"
              initialSearch={filters.search}
              initialStatus={filters.status}
              initialPriority={filters.priority}
              initialSort={filters.sort}
              statusOptions={Object.entries(statusLabels)}
              priorityOptions={Object.entries(priorityLabels)}
            />
          </div>

          {workOrders.length > 0 ? (
            <div className="mt-5 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
                <caption className="sr-only">Work order directory</caption>
                <thead className="text-muted text-xs tracking-wide uppercase">
                  <tr>
                    {[
                      "Job",
                      "Title",
                      "Customer",
                      "Technician",
                      "Priority",
                      "Scheduled",
                      "Status",
                      "Action",
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
                  {workOrders.map((workOrder) => (
                    <tr
                      className="text-foreground hover:bg-surface/60 align-top transition-colors"
                      key={workOrder.id}
                    >
                      <td className="border-border border-b px-3 py-4 pl-0 font-mono text-xs font-semibold">
                        {formatJobReference(workOrder.jobNumber)}
                      </td>
                      <td className="border-border max-w-64 border-b px-3 py-4 font-medium">
                        {workOrder.title}
                      </td>
                      <td className="text-muted border-border border-b px-3 py-4">
                        {workOrder.customer.name}
                      </td>
                      <td className="text-muted border-border border-b px-3 py-4">
                        {workOrder.technician?.name ?? "Unassigned"}
                      </td>
                      <td className="border-border border-b px-3 py-4">
                        <span
                          className={`priority-${workOrder.priority.toLowerCase()} border px-2 py-1 text-xs font-medium whitespace-nowrap`}
                        >
                          {priorityLabels[workOrder.priority]}
                        </span>
                      </td>
                      <td className="text-muted border-border border-b px-3 py-4 whitespace-nowrap">
                        {formatDate(workOrder.scheduledDate)}
                      </td>
                      <td className="border-border border-b px-3 py-4">
                        <span
                          className={`status-${workOrder.status.toLowerCase().replaceAll("_", "-")} border px-2 py-1 text-xs font-medium whitespace-nowrap`}
                        >
                          {statusLabels[workOrder.status]}
                        </span>
                      </td>
                      <td className="border-border border-b px-3 py-4 pr-0">
                        <Link
                          className="text-accent text-xs font-semibold underline-offset-4 hover:underline"
                          href={`/work-orders/${workOrder.id}`}
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-border mt-5 border border-dashed p-10 text-center">
              <p className="text-foreground font-semibold">
                {isFiltered
                  ? "No work orders match these filters"
                  : "No work orders yet"}
              </p>
              <p className="text-muted mt-2 text-sm">
                {isFiltered
                  ? "Try another search or clear the filters."
                  : "Create the first service job to begin tracking work."}
              </p>
            </div>
          )}

          {/* Mobile card list (below lg) */}
          {workOrders.length > 0 ? (
            <ul className="mt-5 grid gap-3 lg:hidden">
              {workOrders.map((workOrder) => (
                <li
                  className="border-border bg-panel border p-4"
                  key={workOrder.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground font-mono text-xs font-semibold">
                        {formatJobReference(workOrder.jobNumber)}
                      </p>
                      <p className="text-foreground mt-1 font-semibold">
                        {workOrder.title}
                      </p>
                    </div>
                    <span
                      className={`status-${workOrder.status.toLowerCase().replaceAll("_", "-")} shrink-0 border px-2 py-1 text-xs font-medium whitespace-nowrap`}
                    >
                      {statusLabels[workOrder.status]}
                    </span>
                  </div>

                  <dl className="text-muted mt-3 grid gap-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                      <dt className="text-muted w-16 shrink-0 text-xs font-medium uppercase">
                        Customer
                      </dt>
                      <dd className="text-foreground min-w-0 break-all">
                        {workOrder.customer.name}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="text-muted w-16 shrink-0 text-xs font-medium uppercase">
                        Tech
                      </dt>
                      <dd className="text-foreground min-w-0">
                        {workOrder.technician?.name ?? "Unassigned"}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="text-muted w-16 shrink-0 text-xs font-medium uppercase">
                        When
                      </dt>
                      <dd className="text-foreground min-w-0">
                        {formatDate(workOrder.scheduledDate)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={`priority-${workOrder.priority.toLowerCase()} border px-2 py-1 text-xs font-medium`}
                    >
                      {priorityLabels[workOrder.priority]} priority
                    </span>
                    <Link
                      className="text-accent text-xs font-semibold underline-offset-4 hover:underline"
                      href={`/work-orders/${workOrder.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {pagination.total > 0 ? (
            <nav
              aria-label="Work order pagination"
              className="text-muted mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <p>
                Showing {(pagination.page - 1) * pagination.pageSize + 1}–
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total,
                )}{" "}
                of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  aria-disabled={pagination.page <= 1}
                  className="border-border text-foreground hover:bg-surface inline-flex min-h-11 items-center border px-4 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  href={workOrdersHref(filters, {
                    page: Math.max(1, pagination.page - 1).toString(),
                  })}
                >
                  Previous
                </Link>
                <span className="px-2" aria-current="page">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Link
                  aria-disabled={pagination.page >= pagination.totalPages}
                  className="border-border text-foreground hover:bg-surface inline-flex min-h-11 items-center border px-4 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  href={workOrdersHref(filters, {
                    page: Math.min(
                      pagination.totalPages,
                      pagination.page + 1,
                    ).toString(),
                  })}
                >
                  Next
                </Link>
              </div>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}

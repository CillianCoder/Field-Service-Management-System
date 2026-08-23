import type { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
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
            <form
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_150px_150px_150px_auto]"
              method="get"
            >
              <label className="sr-only" htmlFor="work-order-search">
                Search work orders
              </label>
              <input
                className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent h-11 border px-3 text-sm focus:outline-none"
                defaultValue={filters.search}
                id="work-order-search"
                name="search"
                placeholder="Job, customer, technician"
              />
              <select
                aria-label="Status"
                className="border-input bg-panel text-foreground focus:border-accent h-11 border px-3 text-sm focus:outline-none"
                defaultValue={filters.status}
                name="status"
              >
                <option value="ALL">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Priority"
                className="border-input bg-panel text-foreground focus:border-accent h-11 border px-3 text-sm focus:outline-none"
                defaultValue={filters.priority}
                name="priority"
              >
                <option value="ALL">All priorities</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Sort work orders"
                className="border-input bg-panel text-foreground focus:border-accent h-11 border px-3 text-sm focus:outline-none"
                defaultValue={filters.sort}
                name="sort"
              >
                <option value="SOONEST">Soonest scheduled</option>
                <option value="LATEST">Latest scheduled</option>
                <option value="PRIORITY">Priority</option>
                <option value="UPDATED">Recently updated</option>
              </select>
              <div className="flex gap-2">
                <button
                  className="bg-foreground h-11 px-4 text-sm font-semibold text-white hover:opacity-90"
                  type="submit"
                >
                  Apply
                </button>
                {isFiltered ? (
                  <Link
                    className="border-border text-foreground hover:bg-surface inline-flex h-11 items-center border px-4 text-sm font-semibold"
                    href="/work-orders"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          {workOrders.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
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

import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Users,
  Wrench,
} from "lucide-react";

import {
  getDashboardData,
  parseDashboardFilters,
} from "@/features/dashboard/queries";
import { requireRole } from "@/lib/auth-session";

type DashboardPageProps = Readonly<{
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

function StatusBadge({ status }: { status: keyof typeof statusLabels }) {
  return (
    <span
      className={`status-${status.toLowerCase().replaceAll("_", "-")} inline-flex border px-2 py-1 text-xs font-medium whitespace-nowrap`}
    >
      {statusLabels[status]}
    </span>
  );
}

function PriorityLabel({
  priority,
}: {
  priority: keyof typeof priorityLabels;
}) {
  return (
    <span
      className={`priority-${priority.toLowerCase()} border px-2 py-1 text-xs font-medium whitespace-nowrap`}
    >
      {priorityLabels[priority]}
    </span>
  );
}

function dashboardHref(
  filters: {
    search: string;
    status: string;
    priority: string;
    page: number;
    overdue: string;
  },
  overrides: Record<string, string>,
) {
  const params = new URLSearchParams({
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    page: filters.page.toString(),
    overdue: filters.overdue,
    ...overrides,
  });
  return `/dashboard?${params.toString()}`;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const filters = parseDashboardFilters(await searchParams);
  const data = await getDashboardData(filters);
  const canManageUsers = session.user.role === "ADMIN";
  const kpis = [
    {
      label: "Open",
      value: data.counts.open,
      icon: BriefcaseBusiness,
      href: "OPEN",
    },
    {
      label: "Assigned",
      value: data.counts.assigned,
      icon: Users,
      href: "ASSIGNED",
    },
    {
      label: "In progress",
      value: data.counts.inProgress,
      icon: Clock3,
      href: "IN_PROGRESS",
    },
    {
      label: "Completed",
      value: data.counts.completed,
      icon: CheckCircle2,
      href: "COMPLETED",
    },
    {
      label: "Overdue",
      value: data.counts.overdue,
      icon: CircleAlert,
      href: "ALL",
    },
  ];

  return (
    <main className="bg-background min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-accent text-sm font-semibold">
              FieldFlow operations
            </p>
            <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted mt-2 text-sm">
              Welcome, {session.user.name}. Here is the current service
              workload.
            </p>
          </div>
          <span className="text-muted flex items-center gap-2 text-sm">
            <Wrench aria-hidden="true" className="size-4" />
            {session.user.role === "ADMIN"
              ? "Admin workspace"
              : "Dispatcher workspace"}
          </span>
        </div>

        <section
          aria-label="Work order summary"
          className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const href =
              kpi.label === "Overdue"
                ? dashboardHref(filters, {
                    status: "ALL",
                    page: "1",
                    overdue: "true",
                  })
                : dashboardHref(filters, { status: kpi.href, page: "1" });
            return (
              <Link
                className="border-border bg-panel hover:border-accent border p-4 transition-colors"
                href={href}
                key={kpi.label}
              >
                <div className="text-muted flex items-center justify-between text-sm">
                  <span>{kpi.label}</span>
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <p className="text-foreground mt-3 text-3xl font-semibold">
                  {kpi.value}
                </p>
              </Link>
            );
          })}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="border-border bg-panel border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-foreground text-lg font-semibold">
                Recent work orders
              </h2>
              <Link
                className="text-accent text-sm font-semibold hover:underline"
                href="/work-orders"
              >
                View all
              </Link>
            </div>
            <form
              className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_150px_auto]"
              method="get"
            >
              <label className="sr-only" htmlFor="dashboard-search">
                Search work orders
              </label>
              <input
                className="border-input bg-panel text-foreground h-11 border px-3 text-sm"
                defaultValue={filters.search}
                id="dashboard-search"
                name="search"
                placeholder="Search job, customer, technician"
              />
              <select
                className="border-input bg-panel text-foreground h-11 border px-3 text-sm"
                defaultValue={filters.status}
                name="status"
                aria-label="Status"
              >
                <option value="ALL">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="border-input bg-panel text-foreground h-11 border px-3 text-sm"
                defaultValue={filters.priority}
                name="priority"
                aria-label="Priority"
              >
                <option value="ALL">All priorities</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                className="bg-accent h-11 px-4 text-sm font-semibold text-white"
                type="submit"
              >
                Filter
              </button>
            </form>

            {data.recentWorkOrders.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
                  <caption className="sr-only">Recent work orders</caption>
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
                    {data.recentWorkOrders.map((job) => (
                      <tr className="text-foreground align-top" key={job.id}>
                        <td className="border-border border-b px-3 py-4 pl-0 font-mono text-xs font-semibold">
                          {formatJobReference(job.jobNumber)}
                        </td>
                        <td className="border-border max-w-56 border-b px-3 py-4 leading-5 font-medium">
                          {job.title}
                        </td>
                        <td className="text-muted border-border border-b px-3 py-4">
                          {job.customer?.name ?? "Unassigned"}
                        </td>
                        <td className="text-muted border-border border-b px-3 py-4">
                          {job.technician?.name ?? "Unassigned"}
                        </td>
                        <td className="border-border border-b px-3 py-4">
                          <PriorityLabel priority={job.priority} />
                        </td>
                        <td className="text-muted border-border border-b px-3 py-4 whitespace-nowrap">
                          {formatDate(job.scheduledDate)}
                        </td>
                        <td className="border-border border-b px-3 py-4">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="border-border border-b px-3 py-4 pr-0">
                          <Link
                            className="text-accent text-xs font-semibold hover:underline"
                            href={`/work-orders/${job.id}`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted border-border mt-5 border border-dashed p-8 text-center text-sm">
                No work orders match the selected filters.
              </p>
            )}

            <div className="text-muted mt-5 flex items-center justify-between text-sm">
              <span>
                Showing {data.recentWorkOrders.length} of{" "}
                {data.pagination.total} work orders
              </span>
              <div className="flex gap-2">
                <Link
                  className="border-border border px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={data.pagination.page <= 1}
                  href={dashboardHref(filters, {
                    page: Math.max(1, data.pagination.page - 1).toString(),
                  })}
                >
                  Previous
                </Link>
                <span className="px-2 py-2">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Link
                  className="border-border border px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={
                    data.pagination.page >= data.pagination.totalPages
                  }
                  href={dashboardHref(filters, {
                    page: Math.min(
                      data.pagination.totalPages,
                      data.pagination.page + 1,
                    ).toString(),
                  })}
                >
                  Next
                </Link>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="border-border bg-panel border p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-foreground text-lg font-semibold">
                  Technician status
                </h2>
                <Link
                  className="text-accent text-sm font-semibold hover:underline"
                  href="/technicians"
                >
                  View all
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {data.technicians.length > 0 ? (
                  data.technicians.map((technician) => (
                    <div
                      className="border-border flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                      key={technician.id}
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {technician.name}
                        </p>
                        <p className="text-muted text-xs">
                          {technician._count.workOrders} active job
                          {technician._count.workOrders === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="text-muted shrink-0 text-xs font-semibold">
                        {technician.status[0] +
                          technician.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm">No technicians found.</p>
                )}
              </div>
            </section>

            <section className="border-border bg-panel border p-5">
              <h2 className="text-foreground text-lg font-semibold">
                Quick links
              </h2>
              <div className="mt-4 grid gap-2">
                <Link
                  className="bg-accent px-3 py-3 text-sm font-semibold text-white"
                  href="/work-orders/new"
                >
                  + New work order
                </Link>
                <Link
                  className="border-border text-foreground border px-3 py-3 text-sm font-semibold"
                  href="/customers"
                >
                  + Customer
                </Link>
                <Link
                  className="border-border text-foreground border px-3 py-3 text-sm font-semibold"
                  href="/technicians"
                >
                  + Technician
                </Link>
                {canManageUsers ? (
                  <Link
                    className="border-border text-foreground border px-3 py-3 text-sm font-semibold"
                    href="/users"
                  >
                    + User
                  </Link>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

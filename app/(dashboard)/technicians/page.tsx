import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { TechnicianForm } from "@/features/technicians/components/technician-form";
import { TechnicianRowActions } from "@/features/technicians/components/technician-row-actions";
import {
  getTechnicians,
  parseTechnicianFilters,
} from "@/features/technicians/queries";
import { requireRole } from "@/lib/auth-session";

export const metadata: Metadata = { title: "Technicians | FieldFlow" };

type TechniciansPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const statusClasses = {
  AVAILABLE: "technician-status-available",
  BUSY: "technician-status-busy",
  OFFLINE: "technician-status-offline",
} as const;

function labelStatus(status: string) {
  return status[0] + status.slice(1).toLowerCase();
}

function technicianHref(
  filters: ReturnType<typeof parseTechnicianFilters>,
  page: number,
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (page > 1) params.set("page", page.toString());
  const query = params.toString();
  return query ? `/technicians?${query}` : "/technicians";
}

export default async function TechniciansPage({
  searchParams,
}: TechniciansPageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const filters = parseTechnicianFilters(await searchParams);
  const { technicians, pagination } = await getTechnicians(filters);
  const isFiltered = Boolean(filters.search || filters.status !== "ALL");

  return (
    <main className="bg-background min-h-screen">
      <AppHeader
        role={session.user.role === "ADMIN" ? "ADMIN" : "DISPATCHER"}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <header className="border-border border-b pb-6">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wider uppercase">
              Management
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold sm:text-3xl">
              Technicians
            </h1>
            <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
              Create technician login accounts, maintain contact details and
              skills, and manage assignment availability.
            </p>
          </div>
        </header>

        <section
          aria-labelledby="create-technician-title"
          className="border-border mt-6 border-b pb-6"
        >
          <div className="mb-5">
            <h2
              className="text-foreground text-xl font-semibold"
              id="create-technician-title"
            >
              Create technician
            </h2>
            <p className="text-muted mt-1 text-sm">
              The initial password is hashed and never stored as plain text.
            </p>
          </div>
          <TechnicianForm />
        </section>

        <section aria-labelledby="technician-list-title" className="mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2
                className="text-foreground text-xl font-semibold"
                id="technician-list-title"
              >
                Technician directory
              </h2>
              <p aria-live="polite" className="text-muted mt-1 text-sm">
                {pagination.total} technician
                {pagination.total === 1 ? "" : "s"} found
              </p>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto]"
              method="get"
            >
              <label className="sr-only" htmlFor="technician-search">
                Search technicians
              </label>
              <input
                className="border-input bg-panel placeholder:text-muted focus:border-accent h-11 border px-3 text-sm focus:outline-none"
                defaultValue={filters.search}
                id="technician-search"
                name="search"
                placeholder="Search name, email, phone"
              />
              <label className="sr-only" htmlFor="technician-status">
                Filter by status
              </label>
              <select
                className="border-input bg-panel focus:border-accent h-11 border px-3 text-sm focus:outline-none"
                defaultValue={filters.status}
                id="technician-status"
                name="status"
              >
                <option value="ALL">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="OFFLINE">Offline</option>
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
                    href="/technicians"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          <div className="border-border mt-5 overflow-x-auto border">
            <table className="w-full min-w-240 border-collapse text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Technician
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Phone
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Skills
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Active jobs
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold"
                    scope="col"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {technicians.map((technician) => {
                  const assignedJobs = technician.workOrders.filter(
                    (job) => job.status === "ASSIGNED",
                  ).length;
                  const inProgressJobs = technician.workOrders.filter(
                    (job) => job.status === "IN_PROGRESS",
                  ).length;
                  return (
                    <tr
                      className="bg-panel hover:bg-surface/60 align-top transition-colors"
                      key={technician.id}
                    >
                      <td className="px-4 py-4">
                        <p className="text-foreground font-semibold">
                          {technician.name}
                        </p>
                        <p className="text-muted mt-1 break-all">
                          {technician.email}
                        </p>
                      </td>
                      <td className="text-foreground px-4 py-4">
                        {technician.phone}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-sm flex-wrap gap-1.5">
                          {technician.skills.map((skill) => (
                            <span
                              className="border-border bg-surface text-foreground border px-2 py-1 text-xs"
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`${statusClasses[technician.status]} inline-flex border px-2.5 py-1 text-xs font-semibold`}
                        >
                          {labelStatus(technician.status)}
                        </span>
                      </td>
                      <td className="text-foreground px-4 py-4">
                        <p>{technician._count.workOrders} total</p>
                        <p className="text-muted mt-1 text-xs">
                          {assignedJobs} assigned, {inProgressJobs} in progress
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <TechnicianRowActions
                          technician={{
                            id: technician.id,
                            name: technician.name,
                            email: technician.email,
                            phone: technician.phone,
                            skills: technician.skills,
                            status: technician.status,
                            assignedJobs,
                            inProgressJobs,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
                {technicians.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={6}>
                      <p className="text-foreground font-semibold">
                        {isFiltered
                          ? "No technicians match these filters"
                          : "No technicians yet"}
                      </p>
                      <p className="text-muted mt-2 text-sm">
                        {isFiltered
                          ? "Try a different search or clear the filters."
                          : "Create the first technician account using the form above."}
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {pagination.total > 0 ? (
            <nav
              aria-label="Technician directory pagination"
              className="text-muted mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
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
                  href={technicianHref(
                    filters,
                    Math.max(1, pagination.page - 1),
                  )}
                >
                  Previous
                </Link>
                <span className="px-2" aria-current="page">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Link
                  aria-disabled={pagination.page >= pagination.totalPages}
                  className="border-border text-foreground hover:bg-surface inline-flex min-h-11 items-center border px-4 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  href={technicianHref(
                    filters,
                    Math.min(pagination.totalPages, pagination.page + 1),
                  )}
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

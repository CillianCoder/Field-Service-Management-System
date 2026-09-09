import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import FiltersFormClient from "@/components/dashboard/FiltersFormClient";
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
  const params = await searchParams;
  const filters = parseTechnicianFilters(params);
  const { technicians, pagination } = await getTechnicians(filters);
  const isFiltered = Boolean(filters.search || filters.status !== "ALL");
  const created = Array.isArray(params.created)
    ? params.created[0]
    : params.created;

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
          {created === "1" ? (
            <p
              className="bg-success-subtle border-success-border text-success-text mt-4 flex items-center gap-2 border px-4 py-3 text-sm font-medium"
              role="status"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ✓
              </span>
              Technician account created successfully.
            </p>
          ) : null}
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
          <TechnicianForm key={created === "1" ? "created" : "fresh"} />
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
            <FiltersFormClient
              action="/technicians"
              initialSearch={filters.search}
              initialStatus={filters.status}
              statusOptions={[
                ["ALL", "All statuses"],
                ["AVAILABLE", "Available"],
                ["BUSY", "Busy"],
                ["OFFLINE", "Offline"],
              ]}
              priorityOptions={[]}
            />
          </div>

          <div className="border-border mt-5 hidden overflow-x-auto border lg:block">
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
              </tbody>
            </table>
          </div>

          {/* Mobile card list (below lg) */}
          <ul className="mt-5 grid gap-3 lg:hidden">
            {technicians.map((technician) => {
              const assignedJobs = technician.workOrders.filter(
                (job) => job.status === "ASSIGNED",
              ).length;
              const inProgressJobs = technician.workOrders.filter(
                (job) => job.status === "IN_PROGRESS",
              ).length;
              return (
                <li
                  className="border-border bg-panel border p-4"
                  key={technician.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground font-semibold">
                        {technician.name}
                      </p>
                      <p className="text-muted mt-0.5 break-all">
                        {technician.email}
                      </p>
                    </div>
                    <span
                      className={`${statusClasses[technician.status]} inline-flex shrink-0 border px-2.5 py-1 text-xs font-semibold`}
                    >
                      {labelStatus(technician.status)}
                    </span>
                  </div>

                  <dl className="text-muted mt-3 grid gap-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                      <dt className="text-muted w-16 shrink-0 text-xs font-medium uppercase">
                        Phone
                      </dt>
                      <dd className="text-foreground min-w-0 break-all">
                        {technician.phone}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="text-muted w-16 shrink-0 text-xs font-medium uppercase">
                        Jobs
                      </dt>
                      <dd className="text-foreground min-w-0">
                        {technician._count.workOrders} total · {assignedJobs}{" "}
                        assigned · {inProgressJobs} in progress
                      </dd>
                    </div>
                  </dl>

                  {technician.skills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {technician.skills.map((skill) => (
                        <span
                          className="border-border bg-surface text-foreground border px-2 py-1 text-xs"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="border-border mt-3 border-t pt-3">
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
                  </div>
                </li>
              );
            })}
            {technicians.length === 0 ? (
              <li className="border-border border border-dashed px-6 py-12 text-center">
                <p className="text-foreground text-sm font-semibold">
                  {isFiltered
                    ? "No technicians match these filters"
                    : "No technicians yet"}
                </p>
                <p className="text-muted mt-2 text-sm">
                  {isFiltered
                    ? "Try a different search or clear the filters."
                    : "Create the first technician account using the form above."}
                </p>
              </li>
            ) : null}
          </ul>
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

          {/* banner moved to header for visibility */}
        </section>
      </div>
    </main>
  );
}

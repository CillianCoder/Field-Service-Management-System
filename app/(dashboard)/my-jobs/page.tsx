import { ClipboardList, Search, Wrench } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import FiltersFormClient from "@/components/dashboard/FiltersFormClient";
import { JobCard } from "@/features/work-orders/components/job-card";
import { LivePageContext } from "@/features/work-orders/components/live-page-context";
import {
  getMyJobs,
  parseWorkOrderFilters,
} from "@/features/work-orders/queries";
import { requireRole } from "@/lib/auth-session";

type MyJobsPageProps = Readonly<{
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

const priorityClasses = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  URGENT: "priority-urgent",
} as const;

const statusClasses = {
  OPEN: "status-open",
  ASSIGNED: "status-assigned",
  IN_PROGRESS: "status-in-progress",
  COMPLETED: "status-completed",
  CANCELLED: "status-cancelled",
} as const;

export default async function MyJobsPage({ searchParams }: MyJobsPageProps) {
  const session = await requireRole(["TECHNICIAN"]);
  const filters = parseWorkOrderFilters(await searchParams);
  const data = await getMyJobs(session.user.id, filters);
  const hasFilters = Boolean(
    filters.search || filters.status !== "ALL" || filters.priority !== "ALL",
  );

  return (
    <main className="bg-background min-h-screen">
      <AppHeader role="TECHNICIAN" />

      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wider uppercase">
              Work
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              My jobs
            </h1>
          </div>
          <div className="text-muted flex items-center gap-2 text-sm">
            <Wrench aria-hidden="true" className="size-4" />
            Technician view
          </div>
        </div>

        <LivePageContext technicianName={session.user.name} />

        <section
          aria-label="Job summary"
          className="mt-6 grid gap-3 sm:grid-cols-3"
        >
          {[
            { label: "Active jobs", value: data.counts.active },
            { label: "In progress", value: data.counts.inProgress },
            { label: "Completed", value: data.counts.completed },
          ].map((item) => (
            <div className="border-border bg-panel border p-4" key={item.label}>
              <p className="text-muted text-sm">{item.label}</p>
              <p className="text-foreground mt-2 font-mono text-2xl font-semibold tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <div className="border-border bg-panel mt-6 border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Search aria-hidden="true" className="text-muted size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <FiltersFormClient
                action="/my-jobs"
                initialSearch={filters.search}
                initialStatus={filters.status}
                initialPriority={filters.priority}
                initialSort={filters.sort}
                statusOptions={Object.entries(statusLabels)}
                priorityOptions={Object.entries(priorityLabels)}
              />
            </div>
          </div>
          {hasFilters ? (
            <Link
              className="text-accent hover:text-accent-hover mt-3 inline-block text-sm font-semibold underline-offset-4 hover:underline"
              href="/my-jobs"
            >
              Clear filters
            </Link>
          ) : null}
        </div>

        <section aria-label="Assigned jobs" className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-foreground text-base font-semibold">
              Your work orders
            </h2>
            <span className="text-muted text-sm">
              {data.jobs.length} {data.jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {data.jobs.length === 0 ? (
            <div className="border-border bg-panel mt-4 flex flex-col items-center justify-center border px-6 py-16 text-center">
              <ClipboardList
                aria-hidden="true"
                className="text-muted size-10"
              />
              <h3 className="text-foreground mt-4 text-lg font-semibold">
                {hasFilters
                  ? "No jobs match these filters"
                  : "No jobs assigned yet"}
              </h3>
              <p className="text-muted mt-2 max-w-md text-sm">
                {hasFilters
                  ? "Try broadening your search or clearing one of the filters."
                  : "New assignments will appear here when they are ready for you."}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {data.jobs.map((job) => (
                <JobCard
                  job={job}
                  key={job.id}
                  priorityClass={priorityClasses[job.priority]}
                  priorityLabel={priorityLabels[job.priority]}
                  statusClass={statusClasses[job.status]}
                  statusLabel={statusLabels[job.status]}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

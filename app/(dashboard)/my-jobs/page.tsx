import { ClipboardList, Search, Wrench } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/components/layout/sign-out-button";
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
      <header className="border-border bg-panel border-b">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link className="flex items-center gap-3 font-semibold" href="/">
            <span
              aria-hidden="true"
              className="bg-accent grid size-8 place-items-center text-sm font-bold text-white"
            >
              F
            </span>
            <span>FieldFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-muted hidden text-sm md:block">
              Technician workspace
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
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
          className="mt-8 grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Active jobs", value: data.counts.active },
            { label: "In progress", value: data.counts.inProgress },
            { label: "Completed", value: data.counts.completed },
          ].map((item) => (
            <div className="border-border bg-panel border p-5" key={item.label}>
              <p className="text-muted text-sm">{item.label}</p>
              <p className="text-foreground mt-2 text-3xl font-semibold">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <form className="border-border bg-panel mt-8 border p-4" method="get">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_160px_180px_auto] lg:items-end">
            <label className="text-foreground text-sm font-medium">
              Search jobs
              <span className="relative mt-2 block">
                <Search
                  aria-hidden="true"
                  className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <input
                  className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent h-11 w-full border pr-3 pl-9 text-sm focus:outline-none"
                  defaultValue={filters.search}
                  name="search"
                  placeholder="Title, customer, or job ID"
                />
              </span>
            </label>
            <label className="text-foreground text-sm font-medium">
              Status
              <select
                className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
                defaultValue={filters.status}
                name="status"
              >
                <option value="ALL">All statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
            <label className="text-foreground text-sm font-medium">
              Priority
              <select
                className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
                defaultValue={filters.priority}
                name="priority"
              >
                <option value="ALL">All priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
            <label className="text-foreground text-sm font-medium">
              Sort by
              <select
                className="border-input bg-panel text-foreground focus:border-accent mt-2 h-11 w-full border px-3 text-sm focus:outline-none"
                defaultValue={filters.sort}
                name="sort"
              >
                <option value="SOONEST">Soonest first</option>
                <option value="LATEST">Latest first</option>
                <option value="PRIORITY">Highest priority</option>
                <option value="UPDATED">Recently updated</option>
              </select>
            </label>
            <button
              className="bg-accent hover:bg-accent-hover h-11 px-5 text-sm font-semibold text-white transition-colors"
              type="submit"
            >
              Apply
            </button>
          </div>
          {hasFilters ? (
            <Link
              className="text-accent hover:text-accent-hover mt-3 inline-block text-sm font-semibold underline-offset-4 hover:underline"
              href="/my-jobs"
            >
              Clear filters
            </Link>
          ) : null}
        </form>

        <section aria-label="Assigned jobs" className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-foreground text-xl font-semibold">
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

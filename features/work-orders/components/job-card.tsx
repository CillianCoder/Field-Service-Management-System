"use client";

import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  History,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useActionState } from "react";

import { initialJobActionState } from "@/features/work-orders/action-state";
import { updateMyJob } from "@/features/work-orders/actions";
import type { MyJob } from "@/features/work-orders/queries";

type JobCardProps = Readonly<{
  job: MyJob;
  priorityLabel: string;
  priorityClass: string;
  statusLabel: string;
  statusClass: string;
}>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatJobReference(jobNumber: number) {
  return `WO-${jobNumber.toString().padStart(4, "0")}`;
}

function formatActivityLabel(
  action: string,
  fromValue: string | null,
  toValue: string | null,
) {
  if (action === "NOTE_ADDED") return "Progress note added";
  if (action === "STATUS_CHANGED" && toValue) {
    const status = toValue.toLowerCase().replaceAll("_", " ");
    return fromValue ? `Status changed to ${status}` : `Marked as ${status}`;
  }

  return action.toLowerCase().replaceAll("_", " ");
}

export function JobCard({
  job,
  priorityLabel,
  priorityClass,
  statusLabel,
  statusClass,
}: JobCardProps) {
  const [state, formAction, isPending] = useActionState(
    updateMyJob,
    initialJobActionState,
  );
  const canStart = job.status === "ASSIGNED";
  const canComplete = job.status === "IN_PROGRESS";

  return (
    <article className="border-border bg-panel border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-semibold uppercase">
            Job #
            <span className="font-mono">
              {formatJobReference(job.jobNumber)}
            </span>
          </p>
          <h3 className="text-foreground mt-2 text-lg font-semibold">
            {job.title}
          </h3>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-xs font-semibold">
          <span className={`border px-2.5 py-1 ${priorityClass}`}>
            {priorityLabel}
          </span>
          <span className={`border px-2.5 py-1 ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="text-muted mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <ClipboardList
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <span>{job.customer.name}</span>
        </p>
        <p className="flex items-start gap-2">
          <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{formatDate(job.scheduledDate)}</span>
        </p>
        <p className="flex items-start gap-2 sm:col-span-2">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{job.customer.address}</span>
        </p>
        <a
          className="hover:text-foreground flex min-h-11 items-center gap-2 underline-offset-4 hover:underline"
          href={`tel:${job.customer.phone}`}
        >
          <Phone aria-hidden="true" className="size-4 shrink-0" />
          <span>{job.customer.phone}</span>
        </a>
        <a
          className="hover:text-foreground flex min-h-11 min-w-0 items-center gap-2 underline-offset-4 hover:underline"
          href={`mailto:${job.customer.email}`}
        >
          <Mail aria-hidden="true" className="size-4 shrink-0" />
          <span className="break-all">{job.customer.email}</span>
        </a>
      </div>
      <p className="text-muted mt-5 line-clamp-2 text-sm">{job.description}</p>

      {canComplete ? (
        <div className="border-border mt-5 grid gap-5 border-t pt-5 sm:grid-cols-2">
          <form action={formAction}>
            <input name="workOrderId" type="hidden" value={job.id} />
            <input name="action" type="hidden" value="NOTE" />
            <label
              className="text-foreground text-sm font-medium"
              htmlFor={`progress-${job.id}`}
            >
              Progress note
              <textarea
                className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 min-h-24 w-full resize-y border p-3 text-sm focus:outline-none"
                disabled={isPending}
                id={`progress-${job.id}`}
                name="notes"
                placeholder="Record an update"
                required
              />
            </label>
            <button
              className="border-input text-foreground hover:border-input-hover mt-3 flex h-10 items-center justify-center gap-2 border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isPending}
              type="submit"
            >
              Save note
            </button>
          </form>
          <form action={formAction}>
            <input name="workOrderId" type="hidden" value={job.id} />
            <input name="action" type="hidden" value="COMPLETE" />
            <label
              className="text-foreground text-sm font-medium"
              htmlFor={`completion-${job.id}`}
            >
              Completion notes
              <textarea
                className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent mt-2 min-h-24 w-full resize-y border p-3 text-sm focus:outline-none"
                disabled={isPending}
                id={`completion-${job.id}`}
                name="notes"
                placeholder="Summarize completed work"
                required
              />
            </label>
            <button
              className="bg-accent hover:bg-accent-hover mt-3 flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              Complete job
            </button>
          </form>
        </div>
      ) : canStart ? (
        <form action={formAction} className="mt-5">
          <input name="workOrderId" type="hidden" value={job.id} />
          <input name="action" type="hidden" value="START" />
          <button
            className="bg-accent hover:bg-accent-hover flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : null}
            Start work
          </button>
        </form>
      ) : null}

      {state.error ? (
        <p className="text-error-text mt-3 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <details className="border-border group mt-5 border-t pt-5">
        <summary className="text-foreground flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <History aria-hidden="true" className="size-4" />
            Job history ({job.activities.length})
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
        </summary>
        {job.activities.length > 0 ? (
          <ol className="border-border mt-3 border-l pl-4">
            {job.activities.map((activity) => (
              <li className="relative pb-4 last:pb-0" key={activity.id}>
                <span
                  aria-hidden="true"
                  className="border-panel bg-muted absolute top-1.5 -left-[1.3125rem] size-2.5 rounded-full border-2"
                />
                <p className="text-foreground text-sm font-medium capitalize">
                  {formatActivityLabel(
                    activity.action,
                    activity.fromValue,
                    activity.toValue,
                  )}
                </p>
                <p className="text-muted mt-1 text-xs">
                  {activity.user.name} | {formatDate(activity.createdAt)}
                </p>
                {activity.notes ? (
                  <p className="text-muted mt-2 text-sm whitespace-pre-wrap">
                    {activity.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted mt-3 text-sm">
            No activity has been recorded for this job yet.
          </p>
        )}
      </details>
    </article>
  );
}

import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { CancelWorkOrderForm } from "@/features/dashboard/components/cancel-work-order-form";
import { getWorkOrderForViewer } from "@/features/work-orders/detail-query";
import { requireRole } from "@/lib/auth-session";
import { isRole } from "@/lib/auth-roles";

import { notFound } from "next/navigation";

type WorkOrderDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
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

function stateClass(prefix: "priority" | "status", value: string) {
  return `${prefix}-${value.toLowerCase().replaceAll("_", "-")}`;
}

export default async function WorkOrderDetailPage({
  params,
}: WorkOrderDetailPageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER", "TECHNICIAN"]);
  const { id } = await params;
  const role = isRole(session.user.role) ? session.user.role : "TECHNICIAN";
  const workOrder = await getWorkOrderForViewer(id, role, session.user.id);

  if (!workOrder) {
    notFound();
  }

  const canCancel =
    (session.user.role === "ADMIN" || session.user.role === "DISPATCHER") &&
    (workOrder.status === "OPEN" || workOrder.status === "ASSIGNED");

  return (
    <main className="bg-background min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          className="text-accent hover:text-accent-hover text-sm font-semibold underline-offset-4 hover:underline"
          href={session.user.role === "TECHNICIAN" ? "/my-jobs" : "/dashboard"}
        >
          Back to {session.user.role === "TECHNICIAN" ? "my jobs" : "dashboard"}
        </Link>

        <header className="border-border mt-8 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
              Job #{formatJobReference(workOrder.jobNumber)}
            </p>
            <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
              {workOrder.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span
              className={`${stateClass("priority", workOrder.priority)} border px-2.5 py-1`}
            >
              {priorityLabels[workOrder.priority]}
            </span>
            <span
              className={`${stateClass("status", workOrder.status)} border px-2.5 py-1`}
            >
              {statusLabels[workOrder.status]}
            </span>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div className="space-y-6">
            <section className="border-border bg-panel border p-5">
              <h2 className="text-foreground text-lg font-semibold">
                Work order details
              </h2>
              <p className="text-muted mt-4 text-sm leading-6 whitespace-pre-wrap">
                {workOrder.description}
              </p>
              <dl className="border-border mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted text-xs font-semibold uppercase">
                    Scheduled
                  </dt>
                  <dd className="text-foreground mt-1 flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="size-4" />
                    {formatDate(workOrder.scheduledDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted text-xs font-semibold uppercase">
                    Last updated
                  </dt>
                  <dd className="text-foreground mt-1">
                    {formatDate(workOrder.updatedAt)}
                  </dd>
                </div>
                {workOrder.completedAt ? (
                  <div>
                    <dt className="text-muted text-xs font-semibold uppercase">
                      Completed
                    </dt>
                    <dd className="text-foreground mt-1">
                      {formatDate(workOrder.completedAt)}
                    </dd>
                  </div>
                ) : null}
                {workOrder.completionNotes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted text-xs font-semibold uppercase">
                      Completion notes
                    </dt>
                    <dd className="text-foreground mt-1 whitespace-pre-wrap">
                      {workOrder.completionNotes}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="border-border bg-panel border p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-foreground text-lg font-semibold">
                  Activity history
                </h2>
                <span className="text-muted text-sm">
                  {workOrder.activities.length} entries
                </span>
              </div>
              {workOrder.activities.length > 0 ? (
                <ol className="border-border mt-5 border-l pl-5">
                  {workOrder.activities.map((activity) => (
                    <li className="relative pb-5 last:pb-0" key={activity.id}>
                      <span
                        aria-hidden="true"
                        className="border-panel bg-muted absolute top-1.5 -left-[1.4375rem] size-2.5 rounded-full border-2"
                      />
                      <p className="text-foreground text-sm font-medium">
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
                <p className="text-muted mt-5 text-sm">
                  No activity has been recorded for this job yet.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border-border bg-panel border p-5">
              <h2 className="text-foreground text-lg font-semibold">
                Customer
              </h2>
              <div className="text-muted mt-4 space-y-3 text-sm">
                <p className="text-foreground font-medium">
                  {workOrder.customer.name}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  {workOrder.customer.address}
                </p>
                <a
                  className="hover:text-foreground flex items-center gap-2 underline-offset-4 hover:underline"
                  href={`tel:${workOrder.customer.phone}`}
                >
                  <Phone aria-hidden="true" className="size-4 shrink-0" />
                  {workOrder.customer.phone}
                </a>
                <a
                  className="hover:text-foreground flex items-start gap-2 break-all underline-offset-4 hover:underline"
                  href={`mailto:${workOrder.customer.email}`}
                >
                  <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {workOrder.customer.email}
                </a>
              </div>
            </section>

            <section className="border-border bg-panel border p-5">
              <h2 className="text-foreground text-lg font-semibold">
                Assigned technician
              </h2>
              {workOrder.technician ? (
                <div className="text-muted mt-4 space-y-2 text-sm">
                  <p className="text-foreground font-medium">
                    {workOrder.technician.name}
                  </p>
                  <p>{workOrder.technician.phone}</p>
                  <p className="break-all">{workOrder.technician.email}</p>
                </div>
              ) : (
                <p className="text-muted mt-4 text-sm">
                  No technician assigned.
                </p>
              )}
            </section>

            {canCancel ? (
              <section className="border-border bg-panel border p-5">
                <h2 className="text-foreground text-lg font-semibold">
                  Actions
                </h2>
                <p className="text-muted mt-2 text-sm">
                  Cancellation is permanent and requires a reason.
                </p>
                <div className="mt-4">
                  <CancelWorkOrderForm workOrderId={workOrder.id} />
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

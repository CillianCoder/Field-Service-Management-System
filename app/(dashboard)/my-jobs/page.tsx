import { requireRole } from "@/lib/auth-session";

export default async function MyJobsPage() {
  const session = await requireRole(["TECHNICIAN"]);

  return (
    <main className="bg-background grid min-h-screen place-items-center px-6 py-12">
      <section className="border-border bg-panel w-full max-w-2xl border p-8 shadow-sm">
        <p className="text-accent text-sm font-semibold">
          FieldFlow technician
        </p>
        <h1 className="text-foreground mt-2 text-3xl font-semibold">
          Welcome, {session.user.name}
        </h1>
        <p className="text-muted mt-3">
          Your assigned jobs workspace will be developed in the next application
          phase.
        </p>
      </section>
    </main>
  );
}

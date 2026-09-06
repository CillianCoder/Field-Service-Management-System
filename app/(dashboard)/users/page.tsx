import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import FiltersFormClient from "@/components/dashboard/FiltersFormClient";
import { UserForm } from "@/features/users/components/user-form";
import { UserRowActions } from "@/features/users/components/user-row-actions";
import { getUsers } from "@/features/users/queries";
import { requireRole } from "@/lib/auth-session";
import { USER_ROLES } from "@/lib/validations/user";

export const metadata: Metadata = { title: "Users | FieldFlow" };

type UsersPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

function roleLabel(role: string) {
  return role[0] + role.slice(1).toLowerCase();
}

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;
  const search = firstValue(params.search);
  const users = await getUsers(search);
  const created = Array.isArray(params.created)
    ? params.created[0]
    : params.created;

  return (
    <main className="bg-background min-h-screen">
      <AppHeader role="ADMIN" />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <header className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted text-xs font-semibold tracking-wider uppercase">
              Administration
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold sm:text-3xl">
              Users
            </h1>
            <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
              Review account access and manage user roles.
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
              User account created successfully.
            </p>
          ) : null}
        </header>

        <section
          aria-labelledby="create-user-title"
          className="border-border mt-6 border-b pb-6"
        >
          <div className="mb-5">
            <h2
              className="text-foreground text-xl font-semibold"
              id="create-user-title"
            >
              Create user
            </h2>
            <p className="text-muted mt-1 text-sm">
              Add an admin or dispatcher account. The initial password is hashed
              and never stored as plain text.
            </p>
          </div>
          <div className="max-w-3xl">
            <UserForm key={created === "1" ? "created" : "fresh"} />
          </div>
        </section>

        <section className="border-border bg-panel mt-6 border p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <FiltersFormClient action="/users" initialSearch={search} />
            <p aria-live="polite" className="text-muted text-sm">
              {users.length} user{users.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="border-border mt-6 overflow-x-auto border">
            <table className="w-full min-w-225 border-collapse text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  {[
                    "User",
                    "Role",
                    "Technician status",
                    "Verification",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th
                      className="px-4 py-3 font-semibold"
                      key={heading}
                      scope="col"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {users.map((user) => (
                  <tr
                    className="bg-panel hover:bg-surface/60 align-top transition-colors"
                    key={user.id}
                  >
                    <td className="px-4 py-4">
                      <p className="text-foreground font-semibold">
                        {user.name}
                      </p>
                      <p className="text-muted mt-1 break-all">{user.email}</p>
                    </td>
                    <td className="text-foreground px-4 py-4">
                      {roleLabel(user.role)}
                    </td>
                    <td className="text-foreground px-4 py-4">
                      {user.technician
                        ? roleLabel(user.technician.status)
                        : "Not applicable"}
                    </td>
                    <td className="text-foreground px-4 py-4">
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </td>
                    <td className="text-muted px-4 py-4">
                      {dateLabel(user.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <UserRowActions
                        user={{
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role as (typeof USER_ROLES)[number],
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={6}>
                      <p className="text-foreground font-semibold">
                        {search ? "No users match this search" : "No users yet"}
                      </p>
                      <p className="text-muted mt-2 text-sm">
                        {search
                          ? "Try a different name or email."
                          : "Users will appear here after accounts are created."}
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

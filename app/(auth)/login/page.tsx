import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { LoginForm } from "@/features/auth/components/login-form";
import { redirectAuthenticatedUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the FieldFlow operations workspace.",
};

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="bg-accent absolute inset-x-0 top-0 h-1"
      />

      <section
        aria-labelledby="login-heading"
        className="border-border bg-panel w-full max-w-md border p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-9"
      >
        <header>
          <div className="flex items-center gap-3">
            <span className="bg-accent grid size-11 shrink-0 place-items-center text-white">
              <BriefcaseBusiness aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-foreground text-xl font-bold">FieldFlow</p>
              <p className="text-muted text-xs font-medium">
                Field service management
              </p>
            </div>
          </div>

          <div className="border-border mt-8 border-t pt-7">
            <h1
              className="text-foreground text-2xl font-semibold"
              id="login-heading"
            >
              Welcome back
            </h1>
            <p className="text-muted mt-2 text-sm leading-6">
              Sign in with your company account to continue.
            </p>
          </div>
        </header>

        <LoginForm />

        <p className="border-border text-muted mt-7 border-t pt-5 text-center text-xs leading-5">
          Access is managed by your FieldFlow administrator.
        </p>
      </section>
    </main>
  );
}

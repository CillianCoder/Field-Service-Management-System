import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { redirectAuthenticatedUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request help recovering access to FieldFlow.",
};

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="bg-accent absolute inset-x-0 top-0 h-1"
      />

      <section
        aria-labelledby="forgot-password-heading"
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
              id="forgot-password-heading"
            >
              Forgot password?
            </h1>
            <p className="text-muted mt-2 text-sm leading-6">
              Enter your company email address to recover your account.
            </p>
          </div>
        </header>

        <ForgotPasswordForm />
      </section>
    </main>
  );
}

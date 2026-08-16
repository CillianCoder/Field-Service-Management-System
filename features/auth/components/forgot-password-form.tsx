"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

type FieldErrors = Partial<Record<keyof ForgotPasswordInput, string>>;

export function ForgotPasswordForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });

    if (!result.success) {
      setFieldErrors({ email: result.error.issues[0]?.message });
      setStatusMessage(null);
      return;
    }

    setFieldErrors({});
    setStatusMessage(
      "Password reset email delivery is not available yet. Contact your FieldFlow administrator for access.",
    );
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
      {statusMessage ? (
        <div
          className="border-border bg-surface text-foreground border px-4 py-3 text-sm leading-6"
          role="status"
        >
          {statusMessage}
        </div>
      ) : null}

      <div>
        <label className="text-foreground text-sm font-medium" htmlFor="email">
          Email address
        </label>
        <div className="relative mt-2">
          <Mail
            aria-hidden="true"
            className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2"
          />
          <input
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            className="border-input bg-panel text-foreground placeholder:text-muted hover:border-input-hover focus:border-accent h-12 w-full border pr-4 pl-11 text-base transition-colors focus:outline-none"
            id="email"
            name="email"
            placeholder="you@company.com"
            type="email"
          />
        </div>
        {fieldErrors.email ? (
          <p className="text-error-text mt-2 text-sm" id="email-error">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <button
        className="bg-accent hover:bg-accent-hover flex h-12 w-full items-center justify-center px-5 text-sm font-semibold text-white shadow-sm transition-colors"
        type="submit"
      >
        Reset password
      </button>

      <div className="text-center">
        <Link
          className="text-foreground hover:text-accent text-sm font-semibold underline-offset-4 hover:underline"
          href="/login"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}

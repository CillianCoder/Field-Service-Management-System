"use client";

import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      const errors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if ((field === "email" || field === "password") && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
        rememberMe: true,
      });

      if (error) {
        setFormError("Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFormError("Sign in is temporarily unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
      {formError ? (
        <div
          className="border-error-border bg-error-subtle text-error-text border px-4 py-3 text-sm"
          role="alert"
        >
          {formError}
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
            disabled={isSubmitting}
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

      <div>
        <label
          className="text-foreground text-sm font-medium"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative mt-2">
          <LockKeyhole
            aria-hidden="true"
            className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2"
          />
          <input
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="current-password"
            className="border-input bg-panel text-foreground hover:border-input-hover focus:border-accent h-12 w-full border pr-12 pl-11 text-base transition-colors focus:outline-none"
            disabled={isSubmitting}
            id="password"
            name="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-muted hover:text-foreground absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center transition-colors"
            disabled={isSubmitting}
            onClick={() => setShowPassword((visible) => !visible)}
            title={showPassword ? "Hide password" : "Show password"}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="text-error-text mt-2 text-sm" id="password-error">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button
        className="bg-accent hover:bg-accent-hover flex h-12 w-full items-center justify-center gap-2 px-5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        ) : null}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

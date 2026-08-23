import Link from "next/link";

import { SignOutButton } from "@/components/layout/sign-out-button";

export function AppHeader() {
  return (
    <header className="border-border bg-panel border-b">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
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
          <span className="text-muted hidden text-sm sm:block">Operations</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

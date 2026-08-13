import Link from "next/link";

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
        <span className="text-muted text-sm">Project scaffold</span>
      </div>
    </header>
  );
}

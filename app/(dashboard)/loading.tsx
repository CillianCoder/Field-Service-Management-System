function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-surface animate-pulse ${className}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <main aria-label="Loading dashboard" className="bg-background min-h-screen">
      <header className="border-border bg-panel border-b">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-8" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
          <SkeletonBlock className="h-5 w-24" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="mt-3 h-9 w-44" />
            <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
          </div>
          <SkeletonBlock className="hidden h-5 w-36 sm:block" />
        </div>

        <section
          aria-label="Loading work order summary"
          className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div className="border-border bg-panel border p-4" key={index}>
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="mt-4 h-9 w-12" />
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="border-border bg-panel border p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_150px_auto]">
              <SkeletonBlock className="h-11" />
              <SkeletonBlock className="h-11" />
              <SkeletonBlock className="h-11" />
              <SkeletonBlock className="h-11 w-20" />
            </div>
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="border-border border-b pb-4" key={index}>
                  <SkeletonBlock className="h-5 w-3/4" />
                  <SkeletonBlock className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          </section>
          <aside className="border-border bg-panel border p-5">
            <SkeletonBlock className="h-6 w-36" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonBlock className="h-16 w-full" key={index} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

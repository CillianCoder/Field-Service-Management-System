import { AppHeader } from "@/components/layout/app-header";

const scaffoldAreas = [
  "Role-based access",
  "Customer records",
  "Technician dispatch",
  "Work order lifecycle",
];

export default function Home() {
  return (
    <div className="bg-surface text-foreground min-h-screen">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:py-20">
        <section className="max-w-3xl">
          <p className="text-accent mb-4 text-sm font-semibold tracking-wide uppercase">
            Field service operations
          </p>
          <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
            FieldFlow project scaffold
          </h1>
          <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
            The application foundation is ready for secure authentication,
            dispatch workflows, and technician job management.
          </p>
        </section>

        <section
          aria-labelledby="scaffold-heading"
          className="border-border bg-panel border p-6 shadow-sm"
        >
          <h2 id="scaffold-heading" className="text-base font-semibold">
            Architecture boundaries
          </h2>
          <ul className="text-muted mt-5 grid gap-3 text-sm">
            {scaffoldAreas.map((area) => (
              <li className="flex items-center gap-3" key={area}>
                <span
                  aria-hidden="true"
                  className="bg-accent size-2 shrink-0"
                />
                {area}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type LivePageContextProps = Readonly<{
  technicianName: string;
}>;

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatContext(date: Date) {
  return {
    greeting: getGreeting(date.getHours()),
    time: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
    date: new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date),
  };
}

export function LivePageContext({ technicianName }: LivePageContextProps) {
  const [context, setContext] = useState(() => formatContext(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setContext(formatContext(new Date()));
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      aria-label="Current date and time"
      className="border-border bg-panel mt-5 border px-5 py-4 text-center"
    >
      <p className="text-foreground text-base font-semibold sm:text-lg">
        {context.greeting}, {technicianName}
      </p>
      <p className="text-muted mt-1 text-sm">
        {context.time} · {context.date}
      </p>
    </section>
  );
}

"use client";

import React from "react";

type Props = {
  action?: string;
  initialSearch?: string;
  initialStatus?: string;
  initialPriority?: string;
  initialSort?: string;
  statusOptions?: Array<[string, string]>;
  priorityOptions?: Array<[string, string]>;
};

export default function FiltersFormClient({
  action = "",
  initialSearch = "",
  initialStatus = "ALL",
  initialPriority = "ALL",
  initialSort = "SOONEST",
  statusOptions = [],
  priorityOptions = [],
}: Props) {
  const [search, setSearch] = React.useState(initialSearch ?? "");
  const [status, setStatus] = React.useState(initialStatus ?? "ALL");
  const [priority, setPriority] = React.useState(initialPriority ?? "ALL");
  const [sort, setSort] = React.useState(initialSort ?? "SOONEST");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (sort) params.set("sort", sort);
    const href = `${action || window.location.pathname}?${params.toString()}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="sr-only" htmlFor="filter-search">
        Search
      </label>
      <input
        id="filter-search"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-input bg-panel text-foreground placeholder:text-muted focus:border-accent h-11 min-w-0 flex-1 basis-64 border px-3 text-sm focus:outline-none"
        placeholder="Search"
      />

      {statusOptions.length > 0 ? (
        <select
          aria-label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border-input bg-panel text-foreground focus:border-accent h-11 basis-36 border px-3 text-sm focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : null}

      {priorityOptions.length > 0 ? (
        <select
          aria-label="Priority"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border-input bg-panel text-foreground focus:border-accent h-11 basis-36 border px-3 text-sm focus:outline-none"
        >
          <option value="ALL">All priorities</option>
          {priorityOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : null}

      <select
        aria-label="Sort"
        name="sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="border-input bg-panel text-foreground focus:border-accent h-11 basis-36 border px-3 text-sm focus:outline-none"
      >
        <option value="SOONEST">Soonest scheduled</option>
        <option value="LATEST">Latest scheduled</option>
        <option value="PRIORITY">Priority</option>
        <option value="UPDATED">Recently updated</option>
      </select>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className="bg-accent hover:bg-accent-hover h-11 px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors"
          type="submit"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatus("ALL");
            setPriority("ALL");
            setSort("SOONEST");
            window.location.href = action || window.location.pathname;
          }}
          className="border-border text-foreground hover:bg-surface inline-flex h-11 min-w-0 items-center border px-4 text-sm font-semibold whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    </form>
  );
}

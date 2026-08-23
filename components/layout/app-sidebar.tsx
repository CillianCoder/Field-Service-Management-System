"use client";

import {
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Role } from "@/generated/prisma/enums";

type AppSidebarProps = Readonly<{
  role: Role;
  mobileOpen: boolean;
  onClose: () => void;
}>;

const groups = [
  {
    label: "Operations",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/technicians", label: "Technicians", icon: Wrench },
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ role, mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const visibleGroups =
    role === "TECHNICIAN"
      ? [
          {
            label: "Work",
            items: [
              { href: "/my-jobs", label: "My jobs", icon: ClipboardList },
            ],
          },
        ]
      : groups;
  const allGroups =
    role === "ADMIN"
      ? [
          ...visibleGroups,
          {
            label: "Administration",
            items: [{ href: "/users", label: "Users", icon: ShieldCheck }],
          },
        ]
      : visibleGroups;

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}
      <aside
        className={`bg-panel border-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-border flex h-16 items-center justify-between border-b px-5">
          <Link
            className="flex items-center gap-3 font-semibold"
            href="/"
            onClick={onClose}
          >
            <span
              aria-hidden="true"
              className="bg-accent grid size-8 place-items-center text-sm font-bold text-white"
            >
              F
            </span>
            <span>FieldFlow</span>
          </Link>
          <button
            aria-label="Close navigation"
            className="text-muted hover:text-foreground grid size-10 place-items-center lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className="flex-1 overflow-y-auto px-3 py-5"
        >
          {allGroups.map((group) => (
            <div className="mb-6 last:mb-0" key={group.label}>
              <p className="text-muted px-3 text-[11px] font-semibold tracking-wider uppercase">
                {group.label}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={`group flex min-h-10 items-center gap-3 px-3 text-sm font-medium transition-colors ${active ? "text-accent bg-blue-50" : "text-muted hover:bg-surface hover:text-foreground"}`}
                      href={item.href}
                      key={item.href}
                      onClick={onClose}
                    >
                      <Icon aria-hidden="true" className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {active ? (
                        <ChevronRight aria-hidden="true" className="size-4" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-border border-t px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-surface text-muted grid size-8 place-items-center"
            >
              <Settings2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">
                Workspace
              </p>
              <p className="text-muted text-xs">{role.toLowerCase()} access</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

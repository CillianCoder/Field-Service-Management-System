"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import type { Role } from "@/generated/prisma/enums";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AppHeaderProps = Readonly<{
  role?: Role;
}>;

export function AppHeader({ role = "DISPATCHER" }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={role}
      />
      <header className="border-border bg-panel fixed top-0 right-0 left-0 z-30 h-16 border-b lg:left-64">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <button
            aria-label="Open navigation"
            className="text-muted hover:text-foreground grid size-10 place-items-center lg:hidden"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <div className="text-muted hidden items-center gap-2 text-sm sm:flex">
            <BriefcaseIcon />
            <span>
              {role === "TECHNICIAN"
                ? "Technician workspace"
                : role === "ADMIN"
                  ? "Admin workspace"
                  : "Operations workspace"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
    </>
  );
}

function BriefcaseIcon() {
  return <span aria-hidden="true" className="bg-accent size-2 rounded-full" />;
}

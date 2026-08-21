"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="text-muted hover:text-foreground flex h-10 items-center gap-2 px-2 text-sm font-semibold transition-colors disabled:opacity-70"
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
    >
      {isPending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <LogOut aria-hidden="true" className="size-4" />
      )}
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}

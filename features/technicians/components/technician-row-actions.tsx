"use client";

import { Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  TechnicianForm,
  type TechnicianFormRecord,
} from "@/features/technicians/components/technician-form";

export function TechnicianRowActions({
  technician,
}: Readonly<{ technician: TechnicianFormRecord }>) {
  const [editing, setEditing] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!editing) return;

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [editing]);

  function closeDialog() {
    setEditing(false);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  return (
    <>
      <button
        aria-label={`Edit ${technician.name}`}
        className="text-accent hover:text-accent-hover inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"
        onClick={() => setEditing(true)}
        ref={editButtonRef}
        type="button"
      >
        <Pencil aria-hidden="true" className="size-4" />
        Edit
      </button>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={closeDialog}
          role="presentation"
        >
          <div
            aria-labelledby={`${technician.id}-edit-title`}
            aria-modal="true"
            className="border-border bg-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto border p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-accent text-sm font-semibold">
                  Edit technician
                </p>
                <h2
                  className="text-foreground mt-1 text-xl font-semibold"
                  id={`${technician.id}-edit-title`}
                >
                  {technician.name}
                </h2>
              </div>
              <button
                aria-label="Close edit dialog"
                className="text-muted hover:text-foreground inline-flex h-11 w-11 items-center justify-center"
                onClick={closeDialog}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="mt-5">
              <TechnicianForm
                technician={technician}
                onCancel={closeDialog}
                onSuccess={closeDialog}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

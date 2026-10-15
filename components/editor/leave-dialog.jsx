"use client";

import { Button } from "@/components/ui/button";

/**
 * @param {{
 *   open: boolean;
 *   onStay: () => void;
 *   onLeave: () => void;
 * }} props
 */
export function LeaveDialog({ open, onStay, onLeave }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-title"
    >
      <div className="bg-popover border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h2 id="leave-title" className="text-title font-semibold">
          Leave without saving?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Your latest changes may not be saved yet. You can stay and wait for
          save to finish, or leave and keep a local recovery copy.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="destructive" onClick={onLeave}>
            Leave
          </Button>
          <Button type="button" onClick={onStay}>
            Stay
          </Button>
        </div>
      </div>
    </div>
  );
}

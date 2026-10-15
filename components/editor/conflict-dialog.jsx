"use client";

import { Button } from "@/components/ui/button";

/**
 * @param {{
 *   open: boolean;
 *   onKeepMine: () => void;
 *   onKeepServer: () => void;
 * }} props
 */
export function ConflictDialog({ open, onKeepMine, onKeepServer }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-title"
    >
      <div className="bg-popover border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h2 id="conflict-title" className="text-title font-semibold">
          This note changed elsewhere
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Choose which version to keep. The other version stays available until
          you decide.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onKeepServer}>
            Keep server version
          </Button>
          <Button type="button" onClick={onKeepMine}>
            Keep my version
          </Button>
        </div>
      </div>
    </div>
  );
}

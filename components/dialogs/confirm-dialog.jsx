"use client";

import { AnimatedOverlay } from "@/components/motion/animated-presence";
import { Button } from "@/components/ui/button";

/**
 * @param {{
 *   open: boolean;
 *   title: string;
 *   description?: string;
 *   confirmLabel?: string;
 *   cancelLabel?: string;
 *   destructive?: boolean;
 *   onConfirm: () => void;
 *   onCancel: () => void;
 * }} props
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <AnimatedOverlay
      open={open}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="bg-popover border-border w-full max-w-md rounded-lg border p-6 shadow-lg"
      >
        <h2 id="confirm-dialog-title" className="text-title font-semibold">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </AnimatedOverlay>
  );
}

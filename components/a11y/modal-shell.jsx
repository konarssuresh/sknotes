"use client";

import { useRef } from "react";

import { useFocusTrap } from "@/lib/a11y/use-focus-trap";

/**
 * Accessible modal surface with focus trap (WCAG 2.4.3).
 * @param {{
 *   open: boolean;
 *   titleId: string;
 *   className?: string;
 *   children: React.ReactNode;
 * }} props
 */
export function ModalShell({ open, titleId, className, children }) {
  const ref = useRef(null);
  useFocusTrap(ref, open);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>
  );
}

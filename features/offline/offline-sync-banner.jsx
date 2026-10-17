"use client";

import { useOnlineStatus } from "@/features/offline/use-online-status";
import { usePendingSyncCount } from "@/features/offline/use-pending-sync-count";

/**
 * @param {{ userId: string }} props
 */
export function OfflineSyncBanner({ userId }) {
  const online = useOnlineStatus();
  const { count } = usePendingSyncCount(userId);

  if (online && count === 0) {
    return null;
  }

  let message =
    "You're offline. Edits are saved on this device until you're back online.";
  if (online && count > 0) {
    message =
      count === 1
        ? "Syncing 1 pending change…"
        : `Syncing ${count} pending changes…`;
  } else if (!online && count > 0) {
    message =
      count === 1
        ? "You're offline — 1 change waiting to sync."
        : `You're offline — ${count} changes waiting to sync.`;
  }

  return (
    <div
      role="status"
      className="border-border bg-muted/80 text-body-sm text-foreground border-b px-(--space-page-x) py-2 text-center"
    >
      {message}
    </div>
  );
}

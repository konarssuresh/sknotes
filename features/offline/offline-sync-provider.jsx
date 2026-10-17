"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { OfflineSyncBanner } from "@/features/offline/offline-sync-banner";
import { invalidateNoteListCaches } from "@/features/notes/note-cache";
import { noteKeys } from "@/features/notes/query-keys";
import { authClient } from "@/lib/auth/auth-client";
import { flushMutationQueue } from "@/lib/offline/sync-queue";
import { useOnlineStatus } from "@/features/offline/use-online-status";

/**
 * @param {{ children: React.ReactNode }} props
 */
export function OfflineSyncProvider({ children }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const online = useOnlineStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !online) {
      return;
    }

    void flushMutationQueue(userId, {
      onNoteCreated: () => {
        invalidateNoteListCaches(queryClient);
      },
      onNoteUpdated: (note) => {
        if (note?.id) {
          queryClient.setQueryData(noteKeys.detail(String(note.id)), note);
        }
        invalidateNoteListCaches(queryClient);
      },
    });
  }, [online, queryClient, userId]);

  return (
    <>
      {userId ? <OfflineSyncBanner userId={userId} /> : null}
      {children}
    </>
  );
}

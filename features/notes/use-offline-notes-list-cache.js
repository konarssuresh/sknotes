"use client";

import { useEffect, useState } from "react";

import { useOnlineStatus } from "@/features/offline/use-online-status";
import {
  buildNotesListCacheKey,
  loadNotesListSnapshot,
  saveNotesListSnapshot,
} from "@/lib/offline/read-cache";

/**
 * @param {string | null} userId
 * @param {"active" | "archived" | "trashed"} status
 * @param {string | null | undefined} tagId
 * @param {string} debouncedQuery
 */
export function useOfflineNotesListCache(
  userId,
  status,
  tagId,
  debouncedQuery
) {
  const online = useOnlineStatus();
  const cacheKey = buildNotesListCacheKey(status, tagId, debouncedQuery);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    let cancelled = false;
    void loadNotesListSnapshot(userId, cacheKey).then((data) => {
      if (!cancelled) {
        setSnapshot(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, cacheKey]);

  const persist = (payload) => {
    if (!userId || !payload) {
      return;
    }
    void saveNotesListSnapshot(userId, cacheKey, payload);
    setSnapshot(payload);
  };

  const effectiveSnapshot = userId ? snapshot : null;
  const showingStaleCopy = !online && Boolean(effectiveSnapshot);

  return {
    snapshot: effectiveSnapshot,
    showingStaleCopy,
    persist,
    online,
    cacheKey,
  };
}

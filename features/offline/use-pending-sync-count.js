"use client";

import { useCallback, useEffect, useState } from "react";

import { getPendingSyncCount } from "@/lib/offline/sync-queue";
import { subscribeSyncStateChange } from "@/lib/offline/sync-events";

/**
 * @param {string | null | undefined} userId
 */
export function usePendingSyncCount(userId) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    const next = await getPendingSyncCount(userId);
    setCount(next);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }
    let cancelled = false;
    getPendingSyncCount(userId).then((next) => {
      if (!cancelled) {
        setCount(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }
    return subscribeSyncStateChange((detail) => {
      if (detail.userId === userId) {
        void refresh();
      }
    });
  }, [refresh, userId]);

  return { count, refresh };
}

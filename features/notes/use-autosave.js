"use client";

/* eslint-disable react-hooks/preserve-manual-memoization -- autosave queue relies on stable manual callbacks */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_MAX_WAIT_MS,
} from "@/lib/notes/autosave-constants";

/**
 * @typedef {"idle" | "pending" | "saving" | "saved" | "error"} SaveStatus
 */

/**
 * @param {{
 *   enabled: boolean;
 *   getPayload: () => { fingerprint: string } | null;
 *   save: (payload: { fingerprint: string }) => Promise<void>;
 *   onSchedule?: () => void;
 * }} options
 */
export function useAutosave({ enabled, getPayload, save, onSchedule }) {
  const [status, setStatus] = useState(/** @type {SaveStatus} */ ("idle"));
  const debounceTimer = useRef(null);
  const maxWaitTimer = useRef(null);
  const firstKeystrokeAt = useRef(null);
  const inFlight = useRef(null);
  const queued = useRef(false);
  const lastConfirmedFingerprint = useRef(null);
  const lastError = useRef(null);

  const clearTimers = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (maxWaitTimer.current) {
      clearTimeout(maxWaitTimer.current);
      maxWaitTimer.current = null;
    }
  }, []);

  const runSave = useCallback(async () => {
    const payload = getPayload();
    if (!payload) {
      return;
    }

    if (inFlight.current) {
      queued.current = true;
      return;
    }

    setStatus("saving");
    const chain = (async () => {
      let current = payload;
      do {
        queued.current = false;
        try {
          await save(current);
          lastConfirmedFingerprint.current = current.fingerprint;
          lastError.current = null;
          const latest = getPayload();
          if (
            !latest ||
            latest.fingerprint === lastConfirmedFingerprint.current
          ) {
            setStatus("saved");
          } else {
            setStatus("pending");
          }
        } catch (error) {
          lastError.current = error;
          setStatus("error");
          throw error;
        }
        current = getPayload();
        if (
          current &&
          current.fingerprint !== lastConfirmedFingerprint.current
        ) {
          continue;
        }
        break;
      } while (
        queued.current ||
        (current && current.fingerprint !== lastConfirmedFingerprint.current)
      );
    })();

    inFlight.current = chain;
    try {
      await chain;
    } finally {
      inFlight.current = null;
      if (queued.current) {
        queued.current = false;
        void runSave();
      }
    }
  }, [getPayload, save]);

  const schedule = useCallback(() => {
    if (!enabled) {
      return;
    }
    onSchedule?.();
    setStatus("pending");
    const now = Date.now();
    if (!firstKeystrokeAt.current) {
      firstKeystrokeAt.current = now;
      maxWaitTimer.current = setTimeout(() => {
        firstKeystrokeAt.current = null;
        clearTimers();
        void runSave();
      }, AUTOSAVE_MAX_WAIT_MS);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      firstKeystrokeAt.current = null;
      if (maxWaitTimer.current) {
        clearTimeout(maxWaitTimer.current);
        maxWaitTimer.current = null;
      }
      debounceTimer.current = null;
      void runSave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [clearTimers, enabled, onSchedule, runSave]);

  const flush = useCallback(async () => {
    clearTimers();
    firstKeystrokeAt.current = null;
    const payload = getPayload();
    if (!payload) {
      return;
    }
    if (
      lastConfirmedFingerprint.current &&
      payload.fingerprint === lastConfirmedFingerprint.current &&
      !inFlight.current
    ) {
      return;
    }
    await runSave();
  }, [clearTimers, getPayload, runSave]);

  const retry = useCallback(() => {
    void runSave();
  }, [runSave]);

  const markSaved = useCallback((fingerprint) => {
    lastConfirmedFingerprint.current = fingerprint;
    setStatus("saved");
  }, []);

  const resetBaseline = useCallback((fingerprint) => {
    lastConfirmedFingerprint.current = fingerprint;
    lastError.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isDirty = useCallback(() => {
    const payload = getPayload();
    if (!payload) {
      return false;
    }
    return payload.fingerprint !== lastConfirmedFingerprint.current;
  }, [getPayload]);

  const needsNavigationGuard = useCallback(() => {
    return (
      status === "saving" ||
      status === "pending" ||
      status === "error" ||
      isDirty()
    );
  }, [isDirty, status]);

  return {
    status,
    schedule,
    flush,
    retry,
    markSaved,
    resetBaseline,
    isDirty,
    needsNavigationGuard,
    lastError,
  };
}

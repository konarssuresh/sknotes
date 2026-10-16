"use client";

/* eslint-disable react-hooks/preserve-manual-memoization, react-hooks/refs -- autosave queue relies on stable manual callbacks and latest handler refs */

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
  const paused = useRef(false);

  const getPayloadRef = useRef(getPayload);
  const saveRef = useRef(save);
  const enabledRef = useRef(enabled);
  getPayloadRef.current = getPayload;
  saveRef.current = save;
  enabledRef.current = enabled;

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

  const runSave = useCallback(
    async (options = {}) => {
      const { propagateError = false } = options;

      if (paused.current) {
        return;
      }

      const payload = getPayloadRef.current();
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
            await saveRef.current(current);
            lastConfirmedFingerprint.current = current.fingerprint;
            lastError.current = null;
            const latest = getPayloadRef.current();
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
            if (error?.isConflict) {
              paused.current = true;
              queued.current = false;
              clearTimers();
              firstKeystrokeAt.current = null;
              return;
            }
            setStatus("error");
            if (propagateError) {
              throw error;
            }
            return;
          }
          current = getPayloadRef.current();
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
        if (queued.current && !paused.current) {
          queued.current = false;
          const followUp = getPayloadRef.current();
          if (
            followUp &&
            followUp.fingerprint !== lastConfirmedFingerprint.current
          ) {
            void runSave();
          }
        } else {
          queued.current = false;
        }
      }
    },
    [clearTimers]
  );

  const schedule = useCallback(() => {
    if (!enabledRef.current || paused.current) {
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
  }, [clearTimers, onSchedule, runSave]);

  const flush = useCallback(async () => {
    clearTimers();
    firstKeystrokeAt.current = null;
    const payload = getPayloadRef.current();
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
    await runSave({ propagateError: true });
  }, [clearTimers, runSave]);

  const retry = useCallback(() => {
    if (paused.current) {
      return;
    }
    void runSave();
  }, [runSave]);

  const markSaved = useCallback((fingerprint) => {
    lastConfirmedFingerprint.current = fingerprint;
    setStatus("saved");
  }, []);

  const resetBaseline = useCallback((fingerprint) => {
    lastConfirmedFingerprint.current = fingerprint;
    lastError.current = null;
    paused.current = false;
    setStatus("idle");
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isDirty = useCallback(() => {
    const payload = getPayloadRef.current();
    if (!payload) {
      return false;
    }
    return payload.fingerprint !== lastConfirmedFingerprint.current;
  }, []);

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

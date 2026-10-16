import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAutosave } from "@/features/notes/use-autosave";
import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_MAX_WAIT_MS,
} from "@/lib/notes/autosave-constants";

describe("useAutosave", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces saves after idle period", async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    let fingerprint = "a";

    const { result } = renderHook(() =>
      useAutosave({
        enabled: true,
        getPayload: () => ({ fingerprint }),
        save,
      })
    );

    act(() => {
      result.current.schedule();
    });

    expect(save).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("forces save after max wait during continuous typing", async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    let fingerprint = "a";

    const { result } = renderHook(() =>
      useAutosave({
        enabled: true,
        getPayload: () => ({ fingerprint }),
        save,
      })
    );

    act(() => {
      result.current.schedule();
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS - 100);
      fingerprint = "b";
      result.current.schedule();
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS - 100);
      fingerprint = "c";
      result.current.schedule();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_MAX_WAIT_MS);
    });
    expect(save).toHaveBeenCalled();
  });

  it("follow-up save uses newest payload after first save completes", async () => {
    vi.useFakeTimers();
    let resolveFirst;
    const save = vi.fn().mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    );
    save.mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ fingerprint }) =>
        useAutosave({
          enabled: true,
          getPayload: () => ({ fingerprint }),
          save,
        }),
      { initialProps: { fingerprint: "v1" } }
    );

    act(() => {
      result.current.schedule();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].fingerprint).toBe("v1");

    rerender({ fingerprint: "v2" });
    act(() => {
      result.current.schedule();
    });

    await act(async () => {
      resolveFirst();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].fingerprint).toBe("v2");
  });

  it("coalesces multiple edits during one in-flight save", async () => {
    vi.useFakeTimers();
    let resolveFirst;
    const save = vi.fn().mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    );
    save.mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ fingerprint }) =>
        useAutosave({
          enabled: true,
          getPayload: () => ({ fingerprint }),
          save,
        }),
      { initialProps: { fingerprint: "a" } }
    );

    act(() => {
      result.current.schedule();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    });

    rerender({ fingerprint: "b" });
    act(() => result.current.schedule());
    rerender({ fingerprint: "c" });
    act(() => result.current.schedule());

    await act(async () => {
      resolveFirst();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].fingerprint).toBe("c");
  });

  it("treats conflict as paused without unhandled rejection", async () => {
    vi.useFakeTimers();
    const conflictErr = Object.assign(new Error("conflict"), {
      isConflict: true,
    });
    const save = vi.fn().mockRejectedValue(conflictErr);
    let unhandled = false;
    const onUnhandled = () => {
      unhandled = true;
    };
    process.on("unhandledRejection", onUnhandled);

    const { result } = renderHook(() =>
      useAutosave({
        enabled: true,
        getPayload: () => ({ fingerprint: "x" }),
        save,
      })
    );

    act(() => {
      result.current.schedule();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    process.off("unhandledRejection", onUnhandled);
    expect(unhandled).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.schedule();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("retries transient failures with the latest payload", async () => {
    vi.useFakeTimers();
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ fp }) =>
        useAutosave({
          enabled: true,
          getPayload: () => ({ fingerprint: fp }),
          save,
        }),
      { initialProps: { fp: "draft-1" } }
    );

    act(() => {
      result.current.schedule();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("error");

    rerender({ fp: "draft-2" });
    await act(async () => {
      result.current.retry();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].fingerprint).toBe("draft-2");
  });
});

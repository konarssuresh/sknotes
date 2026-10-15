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
});

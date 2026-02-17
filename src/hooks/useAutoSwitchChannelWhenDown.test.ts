import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoSwitchChannelWhenDown } from "./useAutoSwitchChannelWhenDown";

describe("useAutoSwitchChannelWhenDown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should not call callback when channel is not down", () => {
    const mockCallback = vi.fn();

    renderHook(() =>
      useAutoSwitchChannelWhenDown({
        isChannelDown: false,
        callback: mockCallback,
      }),
    );

    vi.advanceTimersByTime(5000);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should call callback at 3-second intervals when channel is down", () => {
    const mockCallback = vi.fn();

    renderHook(() =>
      useAutoSwitchChannelWhenDown({
        isChannelDown: true,
        callback: mockCallback,
      }),
    );

    vi.advanceTimersByTime(3000);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(3000);
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });

  it("should stop calling callback when channel comes back up", () => {
    const mockCallback = vi.fn();

    const { rerender } = renderHook(
      ({ isDown }) =>
        useAutoSwitchChannelWhenDown({
          isChannelDown: isDown,
          callback: mockCallback,
        }),
      { initialProps: { isDown: true } },
    );

    vi.advanceTimersByTime(3000);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Channel comes back up
    rerender({ isDown: false });

    vi.advanceTimersByTime(6000);
    // Should still be 1, no new calls
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should restart interval when channel goes down again", () => {
    const mockCallback = vi.fn();

    const { rerender } = renderHook(
      ({ isDown }) =>
        useAutoSwitchChannelWhenDown({
          isChannelDown: isDown,
          callback: mockCallback,
        }),
      { initialProps: { isDown: false } },
    );

    vi.advanceTimersByTime(5000);
    expect(mockCallback).not.toHaveBeenCalled();

    // Channel goes down
    rerender({ isDown: true });

    vi.advanceTimersByTime(3000);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should clear interval on unmount", () => {
    const mockCallback = vi.fn();
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = renderHook(() =>
      useAutoSwitchChannelWhenDown({
        isChannelDown: true,
        callback: mockCallback,
      }),
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should handle callback changes", () => {
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) =>
        useAutoSwitchChannelWhenDown({
          isChannelDown: true,
          callback,
        }),
      { initialProps: { callback: mockCallback1 } },
    );

    vi.advanceTimersByTime(3000);
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).not.toHaveBeenCalled();

    // Change callback
    rerender({ callback: mockCallback2 });

    vi.advanceTimersByTime(3000);
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });
});

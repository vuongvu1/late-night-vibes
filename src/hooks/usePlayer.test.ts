import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePlayer } from "./usePlayer";

// Mock the store
const mockStore = {
  isPlaying: false,
  togglePlaying: vi.fn(),
  videoTitle: "Test Video",
  setVideoTitle: vi.fn(),
  volume: 50,
  setVolume: vi.fn(),
  bgKey: 0,
  changeBackground: vi.fn(),
  isLoading: false,
};

vi.mock("../store", () => ({
  useStore: vi.fn(() => mockStore),
}));

describe("usePlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should return player state and actions", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.togglePlaying).toBeDefined();
    expect(result.current.videoTitle).toBe("Test Video");
    expect(result.current.setVideoTitle).toBeDefined();
    expect(result.current.volume).toBe(50);
    expect(result.current.setVolume).toBeDefined();
    expect(result.current.bgKey).toBe(0);
    expect(result.current.changeBackground).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should set up background change timer on mount", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    renderHook(() => usePlayer());

    expect(setIntervalSpy).toHaveBeenCalled();
  });

  it("should call changeBackground after timer interval", () => {
    renderHook(() => usePlayer());

    // Fast-forward time by 3 minutes (BACKGROUND_UPDATE_TIMER)
    vi.advanceTimersByTime(3 * 60 * 1000);

    expect(mockStore.changeBackground).toHaveBeenCalled();
  });

  it("should clean up timer on unmount", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => usePlayer());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

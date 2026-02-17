import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useChannel } from "./useChannel";

// Mock data
vi.mock("../data.json", () => ({
  default: {
    channels: [
      { id: "1", name: "Channel 1", videoId: "video1" },
      { id: "2", name: "Channel 2", videoId: "video2" },
      { id: "3", name: "Channel 3", videoId: "video3" },
    ],
  },
}));

// Mock the store
const mockStore = {
  activeIndex: 0,
  setActiveIndex: vi.fn(),
  selectRandomChannel: vi.fn(),
  selectNextChannel: vi.fn(),
  selectPreviousChannel: vi.fn(),
};

vi.mock("../store", () => ({
  useStore: vi.fn(() => mockStore),
}));

describe("useChannel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/");
    window.location.hash = "";
  });

  it("should return active channel data", () => {
    const { result } = renderHook(() => useChannel());

    expect(result.current.activeRadioNumber).toBe(1);
    expect(result.current.activeChannel).toBeDefined();
    expect(result.current.activeChannel).toHaveProperty("name", "Channel 1");
  });

  it("should return channel navigation functions", () => {
    const { result } = renderHook(() => useChannel());

    expect(result.current.selectRandomChannel).toBeDefined();
    expect(result.current.selectNextChannel).toBeDefined();
    expect(result.current.selectPreviousChannel).toBeDefined();
  });

  it("should sync active index to URL hash", () => {
    renderHook(() => useChannel());

    expect(window.location.hash).toBe("#1");
  });

  it("should update hash when active index changes", async () => {
    const storeModule = await import("../store");
    vi.mocked(storeModule.useStore).mockReturnValue({
      ...mockStore,
      activeIndex: 1,
    });

    renderHook(() => useChannel());

    expect(window.location.hash).toBe("#2");
  });

  it("should listen to popstate events", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    renderHook(() => useChannel());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
  });

  it("should clean up popstate listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useChannel());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
  });

  it("should calculate radio number correctly", async () => {
    const storeModule = await import("../store");
    vi.mocked(storeModule.useStore).mockReturnValue({
      ...mockStore,
      activeIndex: 2,
    });

    const { result } = renderHook(() => useChannel());

    expect(result.current.activeRadioNumber).toBe(3);
  });
});

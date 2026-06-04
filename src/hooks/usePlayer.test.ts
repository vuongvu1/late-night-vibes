import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayer } from "./usePlayer";

// Mock the store
const mockStore = {
  isPlaying: false,
  togglePlaying: vi.fn(),
  videoTitle: "Test Video",
  setVideoTitle: vi.fn(),
  volume: 50,
  setVolume: vi.fn(),
  isLoading: false,
};

vi.mock("../store", () => ({
  useStore: vi.fn(() => mockStore),
}));

describe("usePlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return player state and actions", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.togglePlaying).toBeDefined();
    expect(result.current.videoTitle).toBe("Test Video");
    expect(result.current.setVideoTitle).toBeDefined();
    expect(result.current.volume).toBe(50);
    expect(result.current.setVolume).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});

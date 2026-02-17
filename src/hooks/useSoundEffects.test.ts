import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSoundEffects } from "./useSoundEffects";

// Mock Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  loop: false,
  volume: 0.5,
  paused: true,
};

globalThis.Audio = vi.fn(function () {
  return mockAudio;
}) as unknown as typeof Audio;

// Mock the store
const mockSoundEffects = [
  { id: "1", name: "Rain", volume: 50, isPlaying: true, file: "rain.mp3" },
  {
    id: "2",
    name: "Thunder",
    volume: 60,
    isPlaying: false,
    file: "thunder.mp3",
  },
];

vi.mock("../store", () => ({
  useStore: vi.fn(() => ({
    soundEffects: mockSoundEffects,
    isPlaying: true,
  })),
}));

describe("useSoundEffects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create audio instances for sound effects", () => {
    renderHook(() => useSoundEffects());

    expect(globalThis.Audio).toHaveBeenCalledWith("rain.mp3");
    expect(globalThis.Audio).toHaveBeenCalledWith("thunder.mp3");
  });

  it("should set loop property on audio instances", () => {
    renderHook(() => useSoundEffects());

    expect(mockAudio.loop).toBe(true);
  });

  it("should update volume based on effect settings", () => {
    renderHook(() => useSoundEffects());

    // Second effect has volume 60, so it should be 0.6
    expect(mockAudio.volume).toBe(0.6); // 60 / 100
  });

  it("should play audio when effect is active and global player is playing", () => {
    renderHook(() => useSoundEffects());

    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("should not play audio when global player is paused", async () => {
    const storeModule = await import("../store");
    mockAudio.paused = false;
    vi.mocked(storeModule.useStore).mockReturnValue({
      soundEffects: mockSoundEffects,
      isPlaying: false,
    });

    renderHook(() => useSoundEffects());

    // When global player is paused, active effects should be paused
    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it("should pause audio when effect is not active", async () => {
    const storeModule = await import("../store");
    vi.mocked(storeModule.useStore).mockReturnValue({
      soundEffects: mockSoundEffects,
      isPlaying: true,
    });

    mockAudio.paused = false;

    renderHook(() => useSoundEffects());

    // Second effect has isPlaying: false, so it should be paused
    expect(mockAudio.pause).toHaveBeenCalled();
  });
});

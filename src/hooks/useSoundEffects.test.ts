import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSoundEffects } from "./useSoundEffects";

// Mock Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  loop: false,
  volume: 0.5,
  paused: true,
};

// biome-ignore lint/complexity/useArrowFunction: vi.fn() mock used as constructor via `new Audio()`; arrow functions cannot be constructors
globalThis.Audio = vi.fn(function () {
  return mockAudio;
}) as unknown as typeof Audio;

const activeRain = {
  id: "1",
  name: "Rain",
  volume: 50,
  isPlaying: true,
  file: "rain.mp3",
};
const inactiveThunder = {
  id: "2",
  name: "Thunder",
  volume: 60,
  isPlaying: false,
  file: "thunder.mp3",
};

vi.mock("../store", () => ({
  useStore: vi.fn(() => ({
    soundEffects: [activeRain, inactiveThunder],
    isPlaying: true,
  })),
}));

async function setStore(state: {
  soundEffects: (typeof activeRain)[];
  isPlaying: boolean;
}) {
  const { useStore } = await import("../store");
  vi.mocked(useStore).mockReturnValue(state);
}

describe("useSoundEffects", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockAudio.loop = false;
    mockAudio.volume = 0.5;
    mockAudio.paused = true;
    await setStore({
      soundEffects: [activeRain, inactiveThunder],
      isPlaying: true,
    });
  });

  it("lazy-loads audio only for activated effects, not inactive ones", () => {
    renderHook(() => useSoundEffects());

    // Active layer gets an Audio instance (and thus its file is fetched)…
    expect(globalThis.Audio).toHaveBeenCalledWith("rain.mp3");
    // …the inactive layer must NOT be instantiated/fetched upfront.
    expect(globalThis.Audio).not.toHaveBeenCalledWith("thunder.mp3");
    expect(globalThis.Audio).toHaveBeenCalledTimes(1);
  });

  it("sets loop on the created audio", () => {
    renderHook(() => useSoundEffects());

    expect(mockAudio.loop).toBe(true);
  });

  it("sets volume from the active effect", () => {
    renderHook(() => useSoundEffects());

    expect(mockAudio.volume).toBe(0.5); // rain volume 50 / 100
  });

  it("plays the active effect when the global player is playing", () => {
    renderHook(() => useSoundEffects());

    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("does not play when the global player is paused", async () => {
    mockAudio.paused = false;
    await setStore({ soundEffects: [activeRain], isPlaying: false });

    renderHook(() => useSoundEffects());

    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it("pauses an effect that gets deactivated after being active", async () => {
    const { rerender } = renderHook(() => useSoundEffects());
    // First render created + played the rain audio; simulate it now playing.
    mockAudio.paused = false;

    // User turns the layer off.
    await setStore({
      soundEffects: [{ ...activeRain, isPlaying: false }],
      isPlaying: true,
    });
    rerender();

    expect(mockAudio.pause).toHaveBeenCalled();
  });
});

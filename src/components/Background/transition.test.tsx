import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

// Paused tab: the static image is the one that gets shown.
vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({ isPlaying: false })),
}));

// Deterministic schedule so the effect has a real key to load.
vi.mock("./schedule", () => ({
  getBackgroundAt: () => ({ key: "vibe-001", msUntilNext: 1_000_000 }),
  loadBackground: vi.fn(async () => ({ gif: "gif-url", static: "static-url" })),
}));

describe("Background image preloading", () => {
  let resolveDecode: (() => void) | undefined;

  // Image whose decode() stays pending until the test resolves it, so we can
  // observe what the component does while the new frame is not yet painted.
  class FakeImage {
    src = "";
    decode() {
      return new Promise<void>((resolve) => {
        resolveDecode = resolve;
      });
    }
  }

  beforeEach(() => {
    resolveDecode = undefined;
    vi.stubGlobal("Image", FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flush = () =>
    act(async () => {
      await new Promise((r) => setTimeout(r));
    });

  it("waits for the new image to decode before fading it in", async () => {
    const Background = (await import("./index")).default;
    const { container } = render(<Background />);
    const el = container.firstChild as HTMLElement;

    // loadBackground has resolved, but decode() is still pending: the container
    // must stay hidden rather than reveal a not-yet-painted image.
    await flush();
    expect(resolveDecode).toBeTypeOf("function"); // decode() was actually awaited
    expect(el.className).toContain("fadeOut");
    expect(el.className).not.toContain("fadeIn");

    // Once decoding finishes, the ready image is allowed to fade in.
    resolveDecode?.();
    await flush();
    expect(el.className).toContain("fadeIn");
  });
});

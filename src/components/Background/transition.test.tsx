import { describe, it, expect, vi, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { FADE_MS } from "@/constants";

// Paused tab: the static image is the one that gets shown.
vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({ isPlaying: false })),
}));

// First call drives the initial paint, the rest drive the rotation. A short
// interval lets the fake-timer test reach the next boundary quickly.
vi.mock("./schedule", () => ({
  getBackgroundAt: vi
    .fn()
    .mockReturnValueOnce({ key: "vibe-001", msUntilNext: 1000 })
    .mockReturnValue({ key: "vibe-002", msUntilNext: 1000 }),
  loadBackground: vi.fn(async (key: string) => ({
    gif: `${key}-gif`,
    static: `${key}-static`,
  })),
}));

const flushMicrotasks = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r));
  });

describe("Background crossfade", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("waits for the new image to decode before mounting its layer", async () => {
    let resolveDecode: (() => void) | undefined;
    class PendingImage {
      src = "";
      decode() {
        return new Promise<void>((resolve) => {
          resolveDecode = resolve;
        });
      }
    }
    vi.stubGlobal("Image", PendingImage);

    const Background = (await import("./index")).default;
    const { container } = render(<Background />);

    // decode() is still pending → nothing is painted yet (no blank/half-loaded
    // frame is allowed to appear).
    await flushMicrotasks();
    expect(resolveDecode).toBeTypeOf("function"); // decode() was actually awaited
    expect(container.querySelectorAll("img")).toHaveLength(0);

    // Once decoding finishes, the layer mounts and the CSS animation fades it in.
    resolveDecode?.();
    await flushMicrotasks();
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("keeps the outgoing layer mounted during the crossfade, then prunes it", async () => {
    class InstantImage {
      src = "";
      decode() {
        return Promise.resolve();
      }
    }
    vi.stubGlobal("Image", InstantImage);
    vi.useFakeTimers();

    const Background = (await import("./index")).default;
    const { container } = render(<Background />);

    // Initial layer: one pair of images.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.querySelectorAll("img")).toHaveLength(2);

    // At the segment boundary the new layer stacks on top while the old one is
    // still mounted — both present, so the images can dissolve into each other.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(container.querySelectorAll("img")).toHaveLength(4);

    // After the crossfade duration the now-hidden outgoing layer is pruned,
    // leaving only the new segment.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(FADE_MS);
    });
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute("src")).toContain("vibe-002");
  });
});

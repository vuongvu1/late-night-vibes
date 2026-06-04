import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the store
vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({
    isPlaying: false,
  })),
}));

// Deterministic schedule so a layer actually loads.
vi.mock("./schedule", () => ({
  getBackgroundAt: () => ({ key: "vibe-001", msUntilNext: 1_000_000 }),
  loadBackground: vi.fn(async () => ({ gif: "gif-url", static: "static-url" })),
}));

// Image that decodes instantly so the layer mounts right away.
class InstantImage {
  src = "";
  decode() {
    return Promise.resolve();
  }
}

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r));
  });

describe("Background", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", InstantImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("should render the background container", async () => {
    const Background = (await import("./index")).default;
    const { container } = render(<Background />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render a layer with two img elements once loaded", async () => {
    const Background = (await import("./index")).default;
    const { container } = render(<Background />);
    await flush();
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
  });

  it("should have correct alt attributes", async () => {
    const Background = (await import("./index")).default;
    const { container } = render(<Background />);
    await flush();
    const images = container.querySelectorAll("img");
    expect(images[0]).toHaveAttribute("alt", "foreground");
    expect(images[1]).toHaveAttribute("alt", "background");
  });

  it("should show the static image while paused", async () => {
    const Background = (await import("./index")).default;
    const { container } = render(<Background />);
    await flush();
    const images = container.querySelectorAll("img");
    expect(images[0].getAttribute("src")).toContain("static-url");
  });

  it("should show the gif while playing", async () => {
    const storeModule = await import("../../store");
    vi.mocked(storeModule.useStore).mockReturnValue({
      isPlaying: true,
    } as ReturnType<typeof storeModule.useStore>);

    const Background = (await import("./index")).default;
    const { container } = render(<Background />);
    await flush();
    const images = container.querySelectorAll("img");
    expect(images[0].getAttribute("src")).toContain("gif-url");
  });
});

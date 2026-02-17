import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import Background from "./index";

// Mock the store
vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({
    isPlaying: false,
  })),
}));

// Mock import.meta.glob
vi.mock("../../assets/gifs/*.gif", () => ({}));
vi.mock("../../assets/gifs/*.webp", () => ({}));
vi.mock("../../assets/static/*.jpg", () => ({}));

describe("Background", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the background container", () => {
    const { container } = render(<Background />);
    const bgContainer = container.firstChild;
    expect(bgContainer).toBeInTheDocument();
  });

  it("should render two img elements (foreground and background)", () => {
    const { container } = render(<Background />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
  });

  it("should have correct alt attributes", () => {
    const { container } = render(<Background />);
    const images = container.querySelectorAll("img");

    expect(images[0]).toHaveAttribute("alt", "foreground");
    expect(images[1]).toHaveAttribute("alt", "background");
  });

  it("should start with fadeOut class", () => {
    const { container } = render(<Background />);
    const bgContainer = container.firstChild as HTMLElement;
    expect(bgContainer.className).toContain("fadeOut");
  });

  it("should render correctly with store state", async () => {
    const storeModule = await import("../../store");
    vi.mocked(storeModule.useStore).mockReturnValue({
      isPlaying: true,
    } as ReturnType<typeof storeModule.useStore>);

    const { container } = render(<Background />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

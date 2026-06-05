import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import YouTubePlayer from "./index";

// Mock window.YT
const mockPlayer = {
  destroy: vi.fn(),
  getVideoUrl: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  setVolume: vi.fn(),
  videoTitle: "Test Video",
};

beforeEach(() => {
  // Setup YT mock
  (globalThis as unknown as { window: { YT: unknown } }).window.YT = {
    // biome-ignore lint/complexity/useArrowFunction: vi.fn() mock used as constructor via `new YT.Player()`; arrow functions cannot be constructors
    Player: vi.fn(function () {
      return mockPlayer;
    }),
    ready: vi.fn((cb) => cb()),
  };
});

describe("YouTubePlayer", () => {
  const defaultProps = {
    videoId: "test-video-id",
    volume: 50,
    isPlaying: false,
    onVideoLoaded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the player container", () => {
    const { container } = render(<YouTubePlayer {...defaultProps} />);
    const playerDiv = container.querySelector("#player");
    expect(playerDiv).toBeInTheDocument();
  });

  it("should initialize YouTube player on mount", () => {
    render(<YouTubePlayer {...defaultProps} />);
    expect(
      (globalThis as unknown as { window: { YT: { Player: unknown } } }).window
        .YT.Player,
    ).toHaveBeenCalled();
  });

  it("should set volume when volume prop changes", () => {
    const { rerender } = render(<YouTubePlayer {...defaultProps} />);

    rerender(<YouTubePlayer {...defaultProps} volume={75} />);

    // Wait for useEffect to run
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(75);
  });

  it("should call onVideoLoaded with video title", () => {
    const mockOnVideoLoaded = vi.fn();
    render(
      <YouTubePlayer {...defaultProps} onVideoLoaded={mockOnVideoLoaded} />,
    );

    // The callback should be called during initialization
    expect(mockOnVideoLoaded).toHaveBeenCalled();
  });

  it("should have correct player id", () => {
    const { container } = render(<YouTubePlayer {...defaultProps} />);
    const playerDiv = container.querySelector("#player");
    expect(playerDiv?.id).toBe("player");
  });
});

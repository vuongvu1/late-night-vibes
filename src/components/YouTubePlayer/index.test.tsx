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
  unMute: vi.fn(),
  loadVideoById: vi.fn(),
  cueVideoById: vi.fn(),
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

  it("unmutes before playing so audio is never left muted on mobile", () => {
    // iOS/Android can leave a programmatically-started player muted. Since the
    // play here is downstream of the user's Play tap, unmute as part of it.
    render(<YouTubePlayer {...defaultProps} isPlaying={true} />);
    expect(mockPlayer.unMute).toHaveBeenCalled();
    expect(mockPlayer.playVideo).toHaveBeenCalled();
  });

  it("reuses the player on channel change while playing (keeps iOS audio unlocked)", () => {
    // Destroying + recreating the <iframe> would drop the audio-autoplay
    // permission from the first Play tap, so on iOS the new channel stays
    // silent. Swap the video on the SAME player instead.
    mockPlayer.getVideoUrl.mockReturnValue(
      "https://www.youtube.com/watch?v=old-id",
    );
    const { rerender } = render(
      <YouTubePlayer {...defaultProps} videoId="old-id" isPlaying={true} />,
    );
    const constructCalls = (
      globalThis as unknown as {
        window: { YT: { Player: { mock: { calls: unknown[] } } } };
      }
    ).window.YT.Player.mock.calls.length;

    rerender(
      <YouTubePlayer {...defaultProps} videoId="new-id" isPlaying={true} />,
    );

    expect(mockPlayer.loadVideoById).toHaveBeenCalledWith("new-id");
    expect(mockPlayer.destroy).not.toHaveBeenCalled();
    // No second YT.Player construction — the same instance was reused.
    expect(
      (
        globalThis as unknown as {
          window: { YT: { Player: { mock: { calls: unknown[] } } } };
        }
      ).window.YT.Player.mock.calls.length,
    ).toBe(constructCalls);
  });

  it("cues (does not auto-play) the new channel when paused", () => {
    mockPlayer.getVideoUrl.mockReturnValue(
      "https://www.youtube.com/watch?v=old-id",
    );
    const { rerender } = render(
      <YouTubePlayer {...defaultProps} videoId="old-id" isPlaying={false} />,
    );

    rerender(
      <YouTubePlayer {...defaultProps} videoId="new-id" isPlaying={false} />,
    );

    expect(mockPlayer.cueVideoById).toHaveBeenCalledWith("new-id");
    expect(mockPlayer.loadVideoById).not.toHaveBeenCalled();
    expect(mockPlayer.destroy).not.toHaveBeenCalled();
  });

  it("recreates instead of crashing when the channel changes before the player is ready", () => {
    // A player still initialising has no control methods yet (loadVideoById /
    // cueVideoById are wired up around onReady). Swapping the video must not
    // call them — that throws "is not a function". Recreate instead.
    const notReadyPlayer = { destroy: vi.fn(), getVideoUrl: vi.fn() };
    // biome-ignore lint/complexity/useArrowFunction: used as a constructor via `new YT.Player()`; arrow functions cannot be constructors
    const NotReadyPlayer = function () {
      return notReadyPlayer;
    };
    (
      globalThis as unknown as { window: { YT: { Player: unknown } } }
    ).window.YT.Player = vi.fn(NotReadyPlayer);

    const { rerender } = render(
      <YouTubePlayer {...defaultProps} videoId="a" isPlaying={true} />,
    );

    expect(() =>
      rerender(
        <YouTubePlayer {...defaultProps} videoId="b" isPlaying={true} />,
      ),
    ).not.toThrow();
  });

  it("updates the title when the player reports a state change", () => {
    // On a channel swap the new title isn't on the player yet, so the title
    // arrives via a later state-change event. Re-reading it then is what keeps
    // the displayed title in sync with the channel.
    const onVideoLoaded = vi.fn();
    render(<YouTubePlayer {...defaultProps} onVideoLoaded={onVideoLoaded} />);

    const { events } = (
      globalThis as unknown as {
        window: {
          YT: {
            Player: { mock: { calls: [string, { events: YT.Events }][] } };
          };
        };
      }
    ).window.YT.Player.mock.calls[0][1];

    onVideoLoaded.mockClear();
    mockPlayer.videoTitle = "New Channel Title";
    events.onStateChange?.({} as YT.OnStateChangeEvent);

    expect(onVideoLoaded).toHaveBeenCalledWith("New Channel Title");
    mockPlayer.videoTitle = "Test Video"; // restore for other tests
  });

  it("does not crash when the YouTube IFrame API failed to load", () => {
    // Simulate the iframe_api script being blocked/timed out: window.YT is
    // never defined. The component must degrade gracefully, not throw.
    (globalThis as unknown as { window: { YT?: unknown } }).window.YT =
      undefined;

    expect(() => render(<YouTubePlayer {...defaultProps} />)).not.toThrow();

    const playerDiv = document.querySelector("#player");
    expect(playerDiv).toBeInTheDocument();
  });
});

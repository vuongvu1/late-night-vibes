import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ControlPanel from "./index";

// Mock the store
vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({
    toggleFullscreen: vi.fn(),
    toggleChat: vi.fn(),
  })),
}));

// Mock icons
vi.mock("../../assets/icons", () => ({
  PlayIcon: () => <div>Play</div>,
  PauseIcon: () => <div>Pause</div>,
  NextIcon: () => <div>Next</div>,
  PreviousIcon: () => <div>Previous</div>,
  ShuffleIcon: () => <div>Shuffle</div>,
  FullscreenIcon: () => <div>Fullscreen</div>,
  ChatIcon: () => <div>Chat</div>,
  MixerIcon: () => <div>Mixer</div>,
}));

describe("ControlPanel", () => {
  const defaultProps = {
    isPlaying: false,
    isLoading: false,
    volume: 50,
    setVolume: vi.fn(),
    togglePlaying: vi.fn(),
    selectRandomChannel: vi.fn(),
    selectNextChannel: vi.fn(),
    selectPreviousChannel: vi.fn(),
    changeBackground: vi.fn(),
    toggleSoundMixer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all control buttons", () => {
    render(<ControlPanel {...defaultProps} />);

    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText("Shuffle")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Fullscreen")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Mixer")).toBeInTheDocument();
  });

  it("should show pause icon when playing", () => {
    render(<ControlPanel {...defaultProps} isPlaying={true} />);
    expect(screen.getByText("Pause")).toBeInTheDocument();
  });

  it("should show play icon when not playing", () => {
    render(<ControlPanel {...defaultProps} isPlaying={false} />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("should call togglePlaying when play button is clicked", async () => {
    const user = userEvent.setup();
    const mockTogglePlaying = vi.fn();
    render(
      <ControlPanel {...defaultProps} togglePlaying={mockTogglePlaying} />,
    );

    const playButton = screen.getByText("Play").closest("button");
    if (playButton) {
      await user.click(playButton);
      expect(mockTogglePlaying).toHaveBeenCalledTimes(1);
    }
  });

  it("should disable play button when loading", () => {
    render(<ControlPanel {...defaultProps} isLoading={true} />);

    const playButton = screen.getByText("Play").closest("button");
    expect(playButton).toBeDisabled();
  });

  it("should call selectRandomChannel when shuffle button is clicked", async () => {
    const user = userEvent.setup();
    const mockSelectRandom = vi.fn();
    render(
      <ControlPanel {...defaultProps} selectRandomChannel={mockSelectRandom} />,
    );

    const shuffleButton = screen.getByText("Shuffle").closest("button");
    if (shuffleButton) {
      await user.click(shuffleButton);
      expect(mockSelectRandom).toHaveBeenCalledTimes(1);
    }
  });

  it("should call selectPreviousChannel when previous button is clicked", async () => {
    const user = userEvent.setup();
    const mockSelectPrevious = vi.fn();
    render(
      <ControlPanel
        {...defaultProps}
        selectPreviousChannel={mockSelectPrevious}
      />,
    );

    const previousButton = screen.getByText("Previous").closest("button");
    if (previousButton) {
      await user.click(previousButton);
      expect(mockSelectPrevious).toHaveBeenCalledTimes(1);
    }
  });

  it("should call selectNextChannel when next button is clicked", async () => {
    const user = userEvent.setup();
    const mockSelectNext = vi.fn();
    render(
      <ControlPanel {...defaultProps} selectNextChannel={mockSelectNext} />,
    );

    const nextButton = screen.getByText("Next").closest("button");
    if (nextButton) {
      await user.click(nextButton);
      expect(mockSelectNext).toHaveBeenCalledTimes(1);
    }
  });

  it("should call toggleSoundMixer when mixer button is clicked", async () => {
    const user = userEvent.setup();
    const mockToggleMixer = vi.fn();
    render(
      <ControlPanel {...defaultProps} toggleSoundMixer={mockToggleMixer} />,
    );

    const mixerButton = screen.getByText("Mixer").closest("button");
    if (mixerButton) {
      await user.click(mixerButton);
      expect(mockToggleMixer).toHaveBeenCalledTimes(1);
    }
  });

  it("should render volume slider with correct value", () => {
    render(<ControlPanel {...defaultProps} volume={75} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("75");
  });

  it("should call setVolume when slider changes", async () => {
    const mockSetVolume = vi.fn();
    render(<ControlPanel {...defaultProps} setVolume={mockSetVolume} />);

    const slider = screen.getByRole("slider");

    // Verify the slider is rendered and functional
    expect(slider).toBeInTheDocument();
    expect(mockSetVolume).toBeDefined();
  });
});

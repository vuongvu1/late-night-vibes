import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SoundEffectsPanel from "./index";

// Mock the store
const mockSoundEffects = [
  { id: "1", name: "Rain", volume: 50, isPlaying: false },
  { id: "2", name: "Thunder", volume: 60, isPlaying: true },
  { id: "3", name: "Wind", volume: 40, isPlaying: false },
];

vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({
    soundEffects: mockSoundEffects,
    toggleSoundEffect: vi.fn(),
    setSoundEffectVolume: vi.fn(),
    resetSoundEffects: vi.fn(),
    randomizeSoundEffects: vi.fn(),
  })),
}));

// Mock icons
vi.mock("../../assets/icons", () => ({
  CloseIcon: () => <div>Close</div>,
  ResetIcon: () => <div>Reset</div>,
  ShuffleIcon: () => <div>Shuffle</div>,
}));

describe("SoundEffectsPanel", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the panel title", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    expect(screen.getByText("Sound Mixer")).toBeInTheDocument();
  });

  it("should render all sound effects", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    expect(screen.getByText("Rain")).toBeInTheDocument();
    expect(screen.getByText("Thunder")).toBeInTheDocument();
    expect(screen.getByText("Wind")).toBeInTheDocument();
  });

  it("should display active count", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<SoundEffectsPanel onClose={mockOnClose} />);

    const closeButton = screen.getByText("Close").closest("div");
    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should render reset and shuffle buttons", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Shuffle")).toBeInTheDocument();
  });

  it("should render volume sliders for each effect", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(mockSoundEffects.length);
  });

  it("should display volume percentages", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("should have correct volume values on sliders", () => {
    render(<SoundEffectsPanel onClose={mockOnClose} />);
    const sliders = screen.getAllByRole("slider");

    expect(sliders[0]).toHaveValue("50");
    expect(sliders[1]).toHaveValue("60");
    expect(sliders[2]).toHaveValue("40");
  });
});

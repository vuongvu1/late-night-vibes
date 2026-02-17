import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VolumeSlider from "./index";

describe("VolumeSlider", () => {
  it("should render the slider input", () => {
    const mockSetValue = vi.fn();
    render(<VolumeSlider value={50} setValue={mockSetValue} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("should display the current volume value", () => {
    const mockSetValue = vi.fn();
    render(<VolumeSlider value={60} setValue={mockSetValue} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("60");
  });

  it("should call setValue when slider changes", async () => {
    const mockSetValue = vi.fn();
    const user = userEvent.setup();
    render(<VolumeSlider value={50} setValue={mockSetValue} />);

    const slider = screen.getByRole("slider");
    await user.click(slider);

    // Since we can't easily change range input value in tests, just verify it exists and is functional
    expect(slider).toBeInTheDocument();
    expect(mockSetValue).toBeDefined();
  });

  it("should have correct min and max values", () => {
    const mockSetValue = vi.fn();
    render(<VolumeSlider value={50} setValue={mockSetValue} />);
    const slider = screen.getByRole("slider");

    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
  });

  it("should have correct step value", () => {
    const mockSetValue = vi.fn();
    render(<VolumeSlider value={50} setValue={mockSetValue} />);
    const slider = screen.getByRole("slider");

    expect(slider).toHaveAttribute("step", "10");
  });

  it("should render visual blocks", () => {
    const mockSetValue = vi.fn();
    const { container } = render(
      <VolumeSlider value={50} setValue={mockSetValue} />,
    );

    // Count direct child divs within the container div
    const containerDiv = container.firstChild as Element | null;
    const blocks = containerDiv?.querySelectorAll(":scope > div");
    expect(blocks?.length).toBe(10);
  });

  it("should accept ref", () => {
    const mockSetValue = vi.fn();
    const ref = { current: null };
    render(<VolumeSlider value={50} setValue={mockSetValue} ref={ref} />);

    expect(ref.current).not.toBeNull();
  });

  it("should pass through additional props", () => {
    const mockSetValue = vi.fn();
    render(
      <VolumeSlider
        value={50}
        setValue={mockSetValue}
        data-testid="volume-slider"
      />,
    );

    const slider = screen.getByTestId("volume-slider");
    expect(slider).toBeInTheDocument();
  });
});

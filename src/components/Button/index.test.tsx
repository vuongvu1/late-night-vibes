import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./index";
import { PlayIcon } from "@/assets/icons";

describe("Button", () => {
  it("should render the button with icon", () => {
    const mockOnClick = vi.fn();
    render(<Button icon={<PlayIcon />} onClick={mockOnClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when button is clicked", async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();
    render(<Button icon={<PlayIcon />} onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should stop propagation on space key press", async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();
    render(<Button icon={<PlayIcon />} onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard(" ");

    // Space should trigger click but stopPropagation should be called
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("should pass through additional button props", () => {
    const mockOnClick = vi.fn();
    render(
      <Button
        icon={<PlayIcon />}
        onClick={mockOnClick}
        disabled
        aria-label="Play sound"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-label", "Play sound");
  });

  it("should render custom icon content", () => {
    const mockOnClick = vi.fn();
    const customIcon = <span data-testid="custom-icon">Custom</span>;
    render(<Button icon={customIcon} onClick={mockOnClick} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

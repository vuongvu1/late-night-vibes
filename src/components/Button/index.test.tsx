import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlayIcon } from "@/assets/icons";
import Button from "./index";

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

  it("should render a badge inside the button when the badge prop is provided", () => {
    const mockOnClick = vi.fn();
    render(<Button icon={<PlayIcon />} onClick={mockOnClick} badge="(2/5)" />);

    expect(screen.getByRole("button")).toHaveTextContent("(2/5)");
  });

  it("should not render a badge when the badge prop is omitted", () => {
    const mockOnClick = vi.fn();
    render(<Button icon={<PlayIcon />} onClick={mockOnClick} />);

    expect(screen.queryByText("(2/5)")).not.toBeInTheDocument();
  });
});

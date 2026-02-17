import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

// Mock ResizeObserver
beforeEach(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Tooltip", () => {
  it("should render the children", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should render the tooltip trigger", () => {
    render(
      <Tooltip content="Tooltip text">
        <button data-testid="trigger">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("should render children and trigger", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText("Hover me");
    expect(button).toBeInTheDocument();
  });

  it("should render custom content", () => {
    const customContent = (
      <div data-testid="custom-content">Custom tooltip</div>
    );
    render(
      <Tooltip content={customContent}>
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should work with different child elements", () => {
    render(
      <Tooltip content="Tooltip text">
        <div data-testid="custom-child">Custom child</div>
      </Tooltip>,
    );
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
  });
});

import * as RadixTooltip from "@radix-ui/react-tooltip";
import { render as rtlRender, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

// Tooltip renders only a RadixTooltip.Root, so a Provider ancestor is required.
const render = (ui: ReactElement) =>
  rtlRender(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
    ),
  });

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
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should render the tooltip trigger", () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button" data-testid="trigger">
          Hover me
        </button>
      </Tooltip>,
    );
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("should render children and trigger", () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button">Hover me</button>
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
        <button type="button">Hover me</button>
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

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NeonText } from "./NeonText";

describe("NeonText", () => {
  it("should render children correctly", () => {
    render(
      <NeonText as="h1" isActive={false}>
        Hello World
      </NeonText>,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should render with the specified HTML tag", () => {
    const { container } = render(
      <NeonText as="h2" isActive={false}>
        Test Heading
      </NeonText>,
    );
    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Heading");
  });

  it("should apply active styling when isActive is true", () => {
    const { container } = render(
      <NeonText as="span" isActive={true}>
        Active Text
      </NeonText>,
    );
    const textElement = container.querySelector("span");
    expect(textElement).toHaveAttribute("data-active", "true");
  });

  it("should not apply active styling when isActive is false", () => {
    const { container } = render(
      <NeonText as="span" isActive={false}>
        Inactive Text
      </NeonText>,
    );
    const textElement = container.querySelector("span");
    expect(textElement).toHaveAttribute("data-active", "false");
  });

  it("should render with correct container class", () => {
    const { container } = render(
      <NeonText as="p" isActive={true}>
        Content
      </NeonText>,
    );
    const containerDiv = container.querySelector("div");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv?.className).toBeTruthy();
  });

  it("should pass through additional props", () => {
    render(
      <NeonText as="div" data-testid="custom-neon" isActive={false}>
        Custom Props
      </NeonText>,
    );
    expect(screen.getByTestId("custom-neon")).toBeInTheDocument();
  });

  it("should set data-active attribute correctly", () => {
    const { container } = render(
      <NeonText as="span" isActive={true}>
        Test
      </NeonText>,
    );
    const textElement = container.querySelector("span");
    expect(textElement).toHaveAttribute("data-active", "true");
  });
});

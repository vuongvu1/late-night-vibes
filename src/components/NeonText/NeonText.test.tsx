import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NeonText } from "./NeonText";

describe("NeonText", () => {
  it("renders the heading tag exactly once — the marquee clone is not a duplicate h1", () => {
    const { container } = render(
      <NeonText as="h1" isActive={false}>
        Hello World
      </NeonText>,
    );
    // Two visible text copies feed the seamless marquee…
    expect(screen.getAllByText("Hello World")).toHaveLength(2);
    // …but only the primary copy is the actual <h1>; the clone is a neutral
    // element so the page never exposes two h1s.
    expect(container.querySelectorAll("h1")).toHaveLength(1);
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

  it("should render a single aria-hidden clone for the seamless marquee", () => {
    const { container } = render(
      <NeonText as="span" isActive={true}>
        Marquee
      </NeonText>,
    );
    const clones = container.querySelectorAll('[aria-hidden="true"]');
    expect(clones).toHaveLength(1);
    expect(clones[0]).toHaveTextContent("Marquee");
  });

  it("should keep pass-through props on the primary copy only", () => {
    render(
      <NeonText as="div" data-testid="custom-neon" isActive={false}>
        Custom Props
      </NeonText>,
    );
    expect(screen.getAllByTestId("custom-neon")).toHaveLength(1);
  });
});

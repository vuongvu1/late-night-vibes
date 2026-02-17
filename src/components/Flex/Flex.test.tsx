import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Flex } from "./Flex";

describe("Flex", () => {
  it("should render children correctly", () => {
    render(
      <Flex>
        <div data-testid="child">Test Child</div>
      </Flex>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should apply default flex direction", () => {
    const { container } = render(<Flex>Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.getPropertyValue("--flex-direction")).toBe("row");
  });

  it("should apply custom flex direction", () => {
    const { container } = render(<Flex direction="column">Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.getPropertyValue("--flex-direction")).toBe(
      "column",
    );
  });

  it("should apply custom justify content", () => {
    const { container } = render(<Flex justify="center">Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.getPropertyValue("--flex-justify")).toBe("center");
  });

  it("should apply custom align items", () => {
    const { container } = render(<Flex align="center">Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.getPropertyValue("--flex-align")).toBe("center");
  });

  it("should apply custom gap", () => {
    const { container } = render(<Flex gap="20px">Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.getPropertyValue("--flex-gap")).toBe("20px");
  });

  it("should apply custom wrap", () => {
    const { container } = render(<Flex wrap="wrap">Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.getPropertyValue("--flex-wrap")).toBe("wrap");
  });

  it("should merge custom className", () => {
    const { container } = render(<Flex className="custom-class">Content</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.className).toContain("custom-class");
  });

  it("should merge custom styles with flex styles", () => {
    const { container } = render(
      <Flex style={{ backgroundColor: "red" }}>Content</Flex>,
    );
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.style.backgroundColor).toBe("red");
    expect(flexElement.style.getPropertyValue("--flex-direction")).toBe("row");
  });

  it("should pass through additional props", () => {
    render(<Flex data-testid="flex-container">Content</Flex>);
    expect(screen.getByTestId("flex-container")).toBeInTheDocument();
  });

  it("should handle all direction values", () => {
    const directions: Array<
      "row" | "row-reverse" | "column" | "column-reverse"
    > = ["row", "row-reverse", "column", "column-reverse"];
    directions.forEach((dir) => {
      const { container } = render(<Flex direction={dir}>Content</Flex>);
      const flexElement = container.firstChild as HTMLElement;
      expect(flexElement.style.getPropertyValue("--flex-direction")).toBe(dir);
    });
  });
});

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("should render the spinner", () => {
    const { container } = render(<Spinner />);
    const spinnerContainer = container.querySelector("div");
    expect(spinnerContainer).toBeInTheDocument();
  });

  it("should have nested spinner element", () => {
    const { container } = render(<Spinner />);
    const spinnerElements = container.querySelectorAll("div");
    expect(spinnerElements.length).toBeGreaterThan(1);
  });

  it("should render with correct structure", () => {
    const { container } = render(<Spinner />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toBeInTheDocument();
    expect(outerDiv.firstChild).toBeInTheDocument();
  });
});

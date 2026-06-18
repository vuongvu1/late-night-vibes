import { act, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDraggable } from "./useDraggable";

// jsdom reports offsetWidth/offsetHeight as 0; stub a concrete panel size so the
// viewport-clamping math has real dimensions to work with.
const PANEL_WIDTH = 300;
const PANEL_HEIGHT = 200;

// Renders the hook against a real DOM node so the internal dragRef is attached,
// mirroring how DraggablePanel wires the ref to its container. Exposes the
// hook's position via data-attributes for assertions.
const Harness = ({
  storageKey,
  initialX,
  initialY,
}: {
  storageKey?: string;
  initialX?: number;
  initialY?: number;
}) => {
  const { position, dragRef } = useDraggable({
    storageKey,
    initialX,
    initialY,
  });
  return createElement("div", {
    ref: dragRef,
    "data-testid": "panel",
    "data-x": position.x,
    "data-y": position.y,
  });
};

const resizeWindowTo = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
};

describe("useDraggable", () => {
  let panel: HTMLElement;
  let widthSpy: ReturnType<typeof vi.spyOn>;
  let heightSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    window.innerWidth = 1280;
    window.innerHeight = 800;
    widthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockReturnValue(PANEL_WIDTH);
    heightSpy = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(PANEL_HEIGHT);
  });

  afterEach(() => {
    widthSpy.mockRestore();
    heightSpy.mockRestore();
  });

  const renderPanel = (props: {
    storageKey?: string;
    initialX?: number;
    initialY?: number;
  }) => {
    const { getByTestId } = render(createElement(Harness, props));
    panel = getByTestId("panel");
    return {
      x: () => Number(panel.dataset.x),
      y: () => Number(panel.dataset.y),
    };
  };

  it("clamps a stored off-screen position into view on mount", () => {
    // Position was persisted from a large window; the window is now small.
    localStorage.setItem("chat-pos", JSON.stringify({ x: 1500, y: 1500 }));
    window.innerWidth = 400;
    window.innerHeight = 300;

    const pos = renderPanel({ storageKey: "chat-pos" });

    // maxX = 400 - 300 = 100, maxY = 300 - 200 = 100
    expect(pos.x()).toBe(100);
    expect(pos.y()).toBe(100);
  });

  it("re-clamps the position when the window shrinks below it", () => {
    // Fits at the default 1280x800 (maxX=980, maxY=600), so mount leaves it.
    const pos = renderPanel({ initialX: 900, initialY: 500 });
    expect(pos.x()).toBe(900);
    expect(pos.y()).toBe(500);

    resizeWindowTo(500, 400);

    // maxX = 500 - 300 = 200, maxY = 400 - 200 = 200
    expect(pos.x()).toBe(200);
    expect(pos.y()).toBe(200);
  });

  it("leaves an in-view position untouched on resize", () => {
    const pos = renderPanel({ initialX: 50, initialY: 50 });

    resizeWindowTo(1024, 768);

    expect(pos.x()).toBe(50);
    expect(pos.y()).toBe(50);
  });

  it("never produces a negative position when the panel is larger than the viewport", () => {
    const pos = renderPanel({ initialX: 500, initialY: 500 });

    resizeWindowTo(100, 100); // smaller than the panel itself

    expect(pos.x()).toBe(0);
    expect(pos.y()).toBe(0);
  });
});

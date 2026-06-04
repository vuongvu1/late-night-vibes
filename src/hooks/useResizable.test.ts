import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useResizable } from "./useResizable";

// Controllable ResizeObserver: capture the callback so tests can fire it.
let fireResize: (() => void) | undefined;

class ControllableResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    fireResize = () => cb([], this as unknown as ResizeObserver);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("useResizable", () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    fireResize = undefined;
    vi.stubGlobal("ResizeObserver", ControllableResizeObserver);
    el = document.createElement("div");
    // jsdom returns zeros for getBoundingClientRect; stub a concrete size.
    el.getBoundingClientRect = () => ({ width: 640, height: 480 }) as DOMRect;
    window.innerWidth = 1024; // desktop by default
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("restores the persisted size onto the element on mount", () => {
    localStorage.setItem(
      "panel-size",
      JSON.stringify({ width: 500, height: 350 }),
    );
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));
    expect(el.style.width).toBe("500px");
    expect(el.style.height).toBe("350px");
  });

  it("does nothing on mount when no size is stored", () => {
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));
    expect(el.style.width).toBe("");
    expect(el.style.height).toBe("");
  });

  it("persists the element size on resize (ignoring the initial callback)", () => {
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));

    fireResize?.(); // synthetic initial callback — ignored
    fireResize?.(); // a real user resize
    vi.advanceTimersByTime(200); // flush the debounce

    expect(JSON.parse(localStorage.getItem("panel-size")!)).toEqual({
      width: 640,
      height: 480,
    });
  });

  it("does not persist size on mobile widths", () => {
    window.innerWidth = 500;
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));

    fireResize?.(); // initial — ignored
    fireResize?.(); // would persist, but mobile guard blocks it
    vi.advanceTimersByTime(200);

    expect(localStorage.getItem("panel-size")).toBeNull();
  });
});

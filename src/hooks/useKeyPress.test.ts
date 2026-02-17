import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyPress } from "./useKeyPress";

describe("useKeyPress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call the action when the specified key is pressed", () => {
    const mockAction = vi.fn();
    const keyActionPairs = { Space: mockAction };

    renderHook(() => useKeyPress(keyActionPairs));

    const event = new KeyboardEvent("keydown", { code: "Space" });
    document.dispatchEvent(event);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple key-action pairs", () => {
    const mockAction1 = vi.fn();
    const mockAction2 = vi.fn();
    const keyActionPairs = {
      Space: mockAction1,
      Enter: mockAction2,
    };

    renderHook(() => useKeyPress(keyActionPairs));

    const event1 = new KeyboardEvent("keydown", { code: "Space" });
    document.dispatchEvent(event1);
    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockAction2).toHaveBeenCalledTimes(0);

    const event2 = new KeyboardEvent("keydown", { code: "Enter" });
    document.dispatchEvent(event2);
    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockAction2).toHaveBeenCalledTimes(1);
  });

  it("should not call action for unregistered keys", () => {
    const mockAction = vi.fn();
    const keyActionPairs = { Space: mockAction };

    renderHook(() => useKeyPress(keyActionPairs));

    const event = new KeyboardEvent("keydown", { code: "KeyA" });
    document.dispatchEvent(event);

    expect(mockAction).not.toHaveBeenCalled();
  });

  it("should remove event listener on unmount", () => {
    const mockAction = vi.fn();
    const keyActionPairs = { Space: mockAction };
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useKeyPress(keyActionPairs));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
  });

  it("should handle arrow keys", () => {
    const mockLeft = vi.fn();
    const mockRight = vi.fn();
    const mockUp = vi.fn();
    const mockDown = vi.fn();

    const keyActionPairs = {
      ArrowLeft: mockLeft,
      ArrowRight: mockRight,
      ArrowUp: mockUp,
      ArrowDown: mockDown,
    };

    renderHook(() => useKeyPress(keyActionPairs));

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    expect(mockLeft).toHaveBeenCalledTimes(1);

    document.dispatchEvent(
      new KeyboardEvent("keydown", { code: "ArrowRight" }),
    );
    expect(mockRight).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
    expect(mockUp).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
    expect(mockDown).toHaveBeenCalledTimes(1);
  });

  it("should update event listeners when keyActionPairs change", () => {
    const mockAction1 = vi.fn();
    const mockAction2 = vi.fn();

    const { rerender } = renderHook(({ pairs }) => useKeyPress(pairs), {
      initialProps: { pairs: { Space: mockAction1 } },
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockAction2).not.toHaveBeenCalled();

    rerender({ pairs: { Space: mockAction2 } });

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockAction2).toHaveBeenCalledTimes(1);
  });
});

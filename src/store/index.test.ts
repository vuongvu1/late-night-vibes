import { beforeEach, describe, expect, it, vi } from "vitest";

describe("store initial volume", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("defaults to 80 on first visit (nothing stored)", async () => {
    // Regression: localStorage.getItem returns null when unset, and
    // Number(null) === 0 — a finite, in-range value that wrongly passed the
    // guard and made the slider read 0 while the player stayed loud.
    const { useStore } = await import("./index");
    expect(useStore.getState().volume).toBe(80);
  });

  it("restores a deliberately stored 0 (not treated as missing)", async () => {
    localStorage.setItem("volume", "0");
    const { useStore } = await import("./index");
    expect(useStore.getState().volume).toBe(0);
  });
});

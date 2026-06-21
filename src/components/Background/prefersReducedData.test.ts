import { afterEach, describe, expect, it, vi } from "vitest";
import { prefersReducedData } from "./prefersReducedData";

describe("prefersReducedData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is true when the connection reports Save-Data", () => {
    vi.stubGlobal("navigator", { connection: { saveData: true } });
    expect(prefersReducedData()).toBe(true);
  });

  it("is true when the prefers-reduced-data media query matches", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    expect(prefersReducedData()).toBe(true);
  });

  it("is false when neither signal is present", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    expect(prefersReducedData()).toBe(false);
  });
});

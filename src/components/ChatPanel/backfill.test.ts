import { describe, it, expect } from "vitest";
import { shouldBackfill } from "./backfill";

describe("shouldBackfill", () => {
  const notScrollable = { scrollHeight: 120, clientHeight: 400 };
  const scrollable = { scrollHeight: 800, clientHeight: 400 };

  it("backfills when the list cannot scroll but more messages exist", () => {
    expect(shouldBackfill(notScrollable, true, false)).toBe(true);
  });

  it("does not backfill when the list overflows (the scroll trigger works)", () => {
    expect(shouldBackfill(scrollable, true, false)).toBe(false);
  });

  it("does not backfill when there are no more messages", () => {
    expect(shouldBackfill(notScrollable, false, false)).toBe(false);
  });

  it("does not backfill while a load is already in flight", () => {
    expect(shouldBackfill(notScrollable, true, true)).toBe(false);
  });

  it("does not backfill an unmeasured (zero-height) container", () => {
    // jsdom reports 0 for layout metrics; this guard keeps the effect inert
    // in tests and avoids trying to fill a container with no height.
    expect(shouldBackfill({ scrollHeight: 0, clientHeight: 0 }, true, false)).toBe(
      false,
    );
  });
});

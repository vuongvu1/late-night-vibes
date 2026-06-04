import { describe, expect, it } from "vitest";
import { MAX_INTERVAL_MIN, MIN_INTERVAL_MIN } from "@/constants";
import { commonKeys, cycleMs, getBackgroundAt, segments } from "./schedule";

const MINUTE_MS = 60 * 1000;

describe("background schedule", () => {
  it("has at least one paired image to rotate through", () => {
    expect(commonKeys.length).toBeGreaterThan(0);
    expect(cycleMs).toBeGreaterThan(0);
  });

  it("is deterministic for a given timestamp", () => {
    const t = 1_700_000_000_123;
    expect(getBackgroundAt(t)).toEqual(getBackgroundAt(t));
  });

  it("uses every image exactly once per cycle", () => {
    const keysInOrder = segments.map((s) => s.key);
    expect(keysInOrder.length).toBe(commonKeys.length);
    expect(new Set(keysInOrder).size).toBe(commonKeys.length);
    expect([...keysInOrder].sort()).toEqual([...commonKeys].sort());
  });

  it("gives every segment a 1–5 minute duration", () => {
    for (const segment of segments) {
      expect(segment.durationMs).toBeGreaterThanOrEqual(
        MIN_INTERVAL_MIN * MINUTE_MS,
      );
      expect(segment.durationMs).toBeLessThanOrEqual(
        MAX_INTERVAL_MIN * MINUTE_MS,
      );
    }
  });

  it("returns the matching segment and time-until-next at any instant", () => {
    for (const segment of segments) {
      // Start of the segment: full duration remains.
      const atStart = getBackgroundAt(segment.startMs);
      expect(atStart.key).toBe(segment.key);
      expect(atStart.msUntilNext).toBe(segment.durationMs);

      // Mid-segment: still the same key, less time remaining.
      const midOffset = Math.floor(segment.durationMs / 2);
      const atMid = getBackgroundAt(segment.startMs + midOffset);
      expect(atMid.key).toBe(segment.key);
      expect(atMid.msUntilNext).toBe(segment.durationMs - midOffset);
    }
  });

  it("repeats identically on the next cycle (global sync property)", () => {
    const t = 42 * MINUTE_MS + 7_321;
    expect(getBackgroundAt(t)).toEqual(getBackgroundAt(t + cycleMs));
  });
});

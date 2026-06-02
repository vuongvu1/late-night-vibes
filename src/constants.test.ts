import { describe, it, expect } from "vitest";
import {
  VOLUME_STEP,
  VIDEO_DOWN_TITLE,
  MIN_INTERVAL_MIN,
  MAX_INTERVAL_MIN,
  SCHEDULE_SEED,
  FADE_MS,
} from "./constants";

describe("constants", () => {
  it("should export VOLUME_STEP as 10", () => {
    expect(VOLUME_STEP).toBe(10);
  });

  it("should export VIDEO_DOWN_TITLE", () => {
    expect(VIDEO_DOWN_TITLE).toBe("Radio channel is down!");
  });

  it("should export a 1–5 minute background interval range", () => {
    expect(MIN_INTERVAL_MIN).toBe(1);
    expect(MAX_INTERVAL_MIN).toBe(5);
    expect(MIN_INTERVAL_MIN).toBeLessThan(MAX_INTERVAL_MIN);
  });

  it("should have correct types", () => {
    expect(typeof VOLUME_STEP).toBe("number");
    expect(typeof VIDEO_DOWN_TITLE).toBe("string");
    expect(typeof MIN_INTERVAL_MIN).toBe("number");
    expect(typeof MAX_INTERVAL_MIN).toBe("number");
    expect(typeof SCHEDULE_SEED).toBe("number");
    expect(typeof FADE_MS).toBe("number");
  });
});

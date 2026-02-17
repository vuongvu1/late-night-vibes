import { describe, it, expect } from "vitest";
import {
  VOLUME_STEP,
  VIDEO_DOWN_TITLE,
  BACKGROUND_UPDATE_TIMER,
} from "./constants";

describe("constants", () => {
  it("should export VOLUME_STEP as 10", () => {
    expect(VOLUME_STEP).toBe(10);
  });

  it("should export VIDEO_DOWN_TITLE", () => {
    expect(VIDEO_DOWN_TITLE).toBe("Radio channel is down!");
  });

  it("should export BACKGROUND_UPDATE_TIMER as 3 minutes in milliseconds", () => {
    expect(BACKGROUND_UPDATE_TIMER).toBe(3 * 60 * 1000);
    expect(BACKGROUND_UPDATE_TIMER).toBe(180000);
  });

  it("should have correct types", () => {
    expect(typeof VOLUME_STEP).toBe("number");
    expect(typeof VIDEO_DOWN_TITLE).toBe("string");
    expect(typeof BACKGROUND_UPDATE_TIMER).toBe("number");
  });
});

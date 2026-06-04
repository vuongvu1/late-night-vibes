import { describe, expect, it } from "vitest";
import { cleanText, formatTimestamp } from "./utils";

describe("cleanText", () => {
  it("should remove multiple spaces and replace them with single spaces", () => {
    const input = "Hello    world";
    const result = cleanText(input);
    expect(result).toBe("Hello world");
  });

  it("should remove newlines", () => {
    const input = "Hello\nworld\ntest";
    const result = cleanText(input);
    expect(result).toBe("Hello world test");
  });

  it("should remove special characters like + and *", () => {
    const input = "Hello + world * test";
    const result = cleanText(input);
    expect(result).toBe("Hello world test");
  });

  it("should remove numbers at the start", () => {
    const input = "123Hello world";
    const result = cleanText(input);
    expect(result).toBe("Hello world");
  });

  it("should remove 【 and 】 brackets", () => {
    const input = "Hello【world】test";
    const result = cleanText(input);
    expect(result).toBe("Hello world test");
  });

  it("should remove emojis", () => {
    const input = "Hello 😊 world 🎉 test";
    const result = cleanText(input);
    expect(result).toBe("Hello  world  test");
  });

  it("should trim the result", () => {
    const input = "  Hello world  ";
    const result = cleanText(input);
    expect(result).toBe("Hello world");
  });

  it("should handle complex text with multiple issues", () => {
    const input = "123 + Hello【world】\n\n  * test 😊";
    const result = cleanText(input);
    expect(result).toBe("Hello world  test");
  });

  it("should return empty string for whitespace-only input", () => {
    const input = "   \n\n   ";
    const result = cleanText(input);
    expect(result).toBe("");
  });
});

describe("formatTimestamp", () => {
  it("should format an ISO date string as day, short month and 24h time (no year)", () => {
    const result = formatTimestamp("2026-06-03T11:46:00");
    expect(result).toMatch(/^\d{1,2} \w{3}, \d{2}:\d{2}$/);
  });

  it("should return an empty string for an invalid date", () => {
    expect(formatTimestamp("not-a-date")).toBe("");
  });
});

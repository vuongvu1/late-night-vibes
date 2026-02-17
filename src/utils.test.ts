import { describe, it, expect } from "vitest";
import { cleanText } from "./utils";

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

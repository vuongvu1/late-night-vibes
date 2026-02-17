import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStory } from "./useStory";

// Mock the services
vi.mock("../services", () => ({
  getStory: vi.fn().mockResolvedValue(
    JSON.stringify({
      title: "Test Story",
      content: "This is a test story",
      author: "Test Author",
    }),
  ),
}));

describe("useStory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined initially", async () => {
    const { result } = renderHook(() => useStory());

    expect(result.current).toBeUndefined();

    // Wait for the async effect to complete
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });

  it("should fetch and set story on mount", async () => {
    const { result } = renderHook(() => useStory());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    expect(result.current).toHaveProperty("title", "Test Story");
  });

  it("should call getStory service", async () => {
    const servicesModule = await import("../services");

    renderHook(() => useStory());

    await waitFor(() => {
      expect(servicesModule.getStory).toHaveBeenCalled();
    });
  });

  it("should parse story JSON correctly", async () => {
    const { result } = renderHook(() => useStory());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    expect(result.current).toHaveProperty("title", "Test Story");
    expect(result.current).toHaveProperty("content", "This is a test story");
    expect(result.current).toHaveProperty("author", "Test Author");
  });

  it("should only fetch story once on mount", async () => {
    const servicesModule = await import("../services");

    const { rerender } = renderHook(() => useStory());

    await waitFor(() => {
      expect(servicesModule.getStory).toHaveBeenCalledTimes(1);
    });

    rerender();

    expect(servicesModule.getStory).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import OnlineCounter from "./OnlineCounter";

// Mock supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockResolvedValue("SUBSCRIBED"),
  unsubscribe: vi.fn(),
  presenceState: vi.fn().mockReturnValue({}),
  track: vi.fn().mockResolvedValue({}),
};

vi.mock("../../services/supabase", () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
  },
}));

describe("OnlineCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial count", () => {
    render(<OnlineCounter />);
    expect(screen.getByText(/listening/i)).toBeInTheDocument();
  });

  it("should display count with 'listening' text", () => {
    render(<OnlineCounter />);
    const text = screen.getByText(/listening/i);
    expect(text.textContent).toMatch(/\d+ listening/);
  });

  it("should render the online indicator dot", () => {
    const { container } = render(<OnlineCounter />);
    const dot = container.querySelector("span:first-child");
    expect(dot).toBeInTheDocument();
  });

  it("should set up presence channel on mount", async () => {
    const { supabase } = await import("../../services/supabase");
    render(<OnlineCounter />);

    expect(supabase.channel).toHaveBeenCalledWith(
      "online-users",
      expect.objectContaining({
        config: expect.objectContaining({
          presence: expect.any(Object),
        }),
      }),
    );
  });

  it("should subscribe to presence events", () => {
    render(<OnlineCounter />);
    expect(mockChannel.on).toHaveBeenCalledWith(
      "presence",
      { event: "sync" },
      expect.any(Function),
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it("should cleanup channel on unmount", () => {
    const { unmount } = render(<OnlineCounter />);
    unmount();
    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });

  it("should track presence when subscribed", async () => {
    const mockSubscribe = vi.fn((callback) => {
      callback("SUBSCRIBED");
      return Promise.resolve("SUBSCRIBED");
    });
    mockChannel.subscribe = mockSubscribe;

    render(<OnlineCounter />);

    await waitFor(() => {
      expect(mockChannel.track).toHaveBeenCalledWith(
        expect.objectContaining({
          online_at: expect.any(String),
        }),
      );
    });
  });
});

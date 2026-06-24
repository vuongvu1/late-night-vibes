import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ONLINE_MAX,
  ONLINE_MIN,
  ONLINE_STEP_MAX_MS,
  ONLINE_STEP_MIN_MS,
} from "@/constants";
import OnlineCounter from "./OnlineCounter";
import { cycleMs, getCountAt } from "./schedule";

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn((cb?: (status: string) => void) => {
    cb?.("SUBSCRIBED");
    return Promise.resolve("SUBSCRIBED");
  }),
  unsubscribe: vi.fn(),
  presenceState: vi.fn().mockReturnValue({}),
  track: vi.fn().mockResolvedValue({}),
};

vi.mock("../../services/supabase", () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
  },
}));

// Walk one full cycle, landing exactly on each step boundary, yielding
// consecutive [prev, cur] count pairs.
function* adjacentPairs() {
  let t = 0;
  let prev = getCountAt(t).count;
  t += getCountAt(t).msUntilNext;
  while (t < cycleMs) {
    const cur = getCountAt(t).count;
    yield [prev, cur] as const;
    prev = cur;
    t += getCountAt(t).msUntilNext;
  }
}

describe("online count base walk", () => {
  it("stays within [MIN, MAX] across the whole cycle", () => {
    for (let t = 0; t < cycleMs; t += 1000) {
      const { count } = getCountAt(t);
      expect(count).toBeGreaterThanOrEqual(ONLINE_MIN);
      expect(count).toBeLessThanOrEqual(ONLINE_MAX);
    }
  });

  it("changes by exactly 1 at every step", () => {
    for (const [prev, cur] of adjacentPairs()) {
      expect(Math.abs(cur - prev)).toBe(1);
    }
  });

  it("at MIN only goes up, at MAX only goes down", () => {
    for (const [prev, cur] of adjacentPairs()) {
      if (prev === ONLINE_MIN) expect(cur).toBe(ONLINE_MIN + 1);
      if (prev === ONLINE_MAX) expect(cur).toBe(ONLINE_MAX - 1);
    }
  });

  it("steps last 10–30s", () => {
    const { msUntilNext } = getCountAt(0); // at a boundary => full step duration
    expect(msUntilNext).toBeGreaterThanOrEqual(ONLINE_STEP_MIN_MS);
    expect(msUntilNext).toBeLessThanOrEqual(ONLINE_STEP_MAX_MS);
  });

  it("is deterministic, so every client computes the same count", () => {
    expect(getCountAt(123_456)).toEqual(getCountAt(123_456));
  });
});

describe("OnlineCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'N listening' (base walk + presence)", () => {
    render(<OnlineCounter />);
    expect(screen.getByText(/^\d+ listening$/)).toBeInTheDocument();
  });

  it("sets up the presence channel and tracks self", async () => {
    render(<OnlineCounter />);
    const { supabase } = await import("../../services/supabase");
    expect(supabase.channel).toHaveBeenCalledWith(
      "online-users",
      expect.objectContaining({
        config: expect.objectContaining({ presence: expect.any(Object) }),
      }),
    );
    await waitFor(() => {
      expect(mockChannel.track).toHaveBeenCalledWith(
        expect.objectContaining({ online_at: expect.any(String) }),
      );
    });
  });

  it("marks the dot disconnected when the channel errors", async () => {
    mockChannel.subscribe = vi.fn((cb?: (status: string) => void) => {
      cb?.("CHANNEL_ERROR");
      return Promise.resolve("CHANNEL_ERROR");
    });
    const { container } = render(<OnlineCounter />);
    await waitFor(() => {
      expect(container.querySelector("span:first-child")).toHaveAttribute(
        "data-connected",
        "false",
      );
    });
  });

  it("cleans up the channel on unmount", () => {
    const { unmount } = render(<OnlineCounter />);
    unmount();
    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });
});

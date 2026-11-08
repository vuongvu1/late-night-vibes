import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, nextPhase } from "./phase";

describe("nextPhase", () => {
  const s = DEFAULT_SETTINGS; // 4 rounds before a long break

  it("goes focus → short break mid-cycle, keeping the round", () => {
    expect(nextPhase({ phase: "focus", round: 1 }, s)).toEqual({
      phase: "short",
      round: 1,
    });
  });

  it("goes short break → next focus round", () => {
    expect(nextPhase({ phase: "short", round: 1 }, s)).toEqual({
      phase: "focus",
      round: 2,
    });
  });

  it("takes a long break after the last focus round", () => {
    expect(nextPhase({ phase: "focus", round: 4 }, s)).toEqual({
      phase: "long",
      round: 4,
    });
  });

  it("starts over at round 1 after the long break", () => {
    expect(nextPhase({ phase: "long", round: 4 }, s)).toEqual({
      phase: "focus",
      round: 1,
    });
  });

  it("with rounds = 1 every focus round ends in a long break", () => {
    expect(
      nextPhase({ phase: "focus", round: 1 }, { ...s, rounds: 1 }),
    ).toEqual({ phase: "long", round: 1 });
  });
});

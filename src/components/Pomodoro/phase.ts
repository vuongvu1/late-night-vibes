export type Phase = "focus" | "short" | "long";

/** Minutes per phase, plus how many focus rounds come before a long break. */
export interface PomodoroSettings {
  focus: number;
  short: number;
  long: number;
  rounds: number;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focus: 25,
  short: 5,
  long: 15,
  rounds: 4,
};

/** Where we are in the cycle. `round` is the 1-based focus round (1..rounds). */
export interface Cycle {
  phase: Phase;
  round: number;
}

/**
 * The phase that follows `cycle` once its time is up. Pure, so the whole loop
 * (focus → short → focus … → long → back to round 1) is unit-tested in
 * phase.test.ts without timers.
 */
export function nextPhase(cycle: Cycle, settings: PomodoroSettings): Cycle {
  if (cycle.phase === "focus") {
    // `>=` not `===`: if "rounds" is lowered mid-cycle below the current
    // round, the long break still comes instead of being skipped forever.
    const phase = cycle.round >= settings.rounds ? "long" : "short";
    return { phase, round: cycle.round };
  }
  if (cycle.phase === "short")
    return { phase: "focus", round: cycle.round + 1 };
  return { phase: "focus", round: 1 };
}

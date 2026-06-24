import {
  ONLINE_MAX,
  ONLINE_MIN,
  ONLINE_SEED,
  ONLINE_STEP_MAX_MS,
  ONLINE_STEP_MIN_MS,
  ONLINE_STEPS,
} from "@/constants";

// Deterministic PRNG (mulberry32): same seed => same sequence on every client,
// so the listener count stays in sync without any server round-trip. Same trick
// as the background rotation in components/Background/schedule.ts (duplicated
// rather than shared — a 7-line pure helper isn't worth coupling the two modules).
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rng = mulberry32(ONLINE_SEED);
const DURATION_SPAN = ONLINE_STEP_MAX_MS - ONLINE_STEP_MIN_MS + 1;

// Precompute one cycle of the walk: a list of (count, cumulative-end-ms) steps.
// Each step moves ±1 from the previous, clamped to [MIN, MAX] — at MIN it can
// only go up, at MAX only down. Start mid-range; durations are a seeded 10–30s.
const counts: number[] = [];
const cumulativeMs: number[] = [];
let value = Math.floor((ONLINE_MIN + ONLINE_MAX) / 2);
let acc = 0;
for (let i = 0; i < ONLINE_STEPS; i++) {
  if (i > 0) {
    const up =
      value === ONLINE_MIN ? true : value === ONLINE_MAX ? false : rng() < 0.5;
    value += up ? 1 : -1;
  }
  counts.push(value);
  acc += ONLINE_STEP_MIN_MS + Math.floor(rng() * DURATION_SPAN);
  cumulativeMs.push(acc);
}

export const cycleMs = acc;

/**
 * The listener count at a given wall-clock instant. Pure: identical input =>
 * identical output, and identical across clients. `msUntilNext` is how long
 * until the count next changes, so callers schedule the next tick exactly on time.
 *
 * ponytail: the walk loops every ~2.8h and the wrap (last step -> first) can jump
 * by more than 1 once per cycle. Cosmetic for a listener count; if it ever matters,
 * mirror the walk (forward then back) so the two ends meet.
 */
export const getCountAt = (
  nowMs: number,
): { count: number; msUntilNext: number } => {
  const offset = ((nowMs % cycleMs) + cycleMs) % cycleMs;
  let p = 0;
  while (p < cumulativeMs.length && cumulativeMs[p] <= offset) p++;
  return { count: counts[p], msUntilNext: cumulativeMs[p] - offset };
};

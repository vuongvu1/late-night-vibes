import { MAX_INTERVAL_MIN, MIN_INTERVAL_MIN, SCHEDULE_SEED } from "@/constants";

const gifModules = import.meta.glob(
  ["../../assets/gifs/*.gif", "../../assets/gifs/*.webp"],
  { import: "default" },
);

const staticModules = import.meta.glob(["../../assets/static/*.jpg"], {
  import: "default",
});

const toDict = (modules: Record<string, unknown>) =>
  Object.keys(modules).reduce(
    (acc, path) => {
      const filename = path.split("/").pop()?.split(".")[0];
      if (filename) acc[filename] = path;
      return acc;
    },
    {} as Record<string, string>,
  );

const gifDict = toDict(gifModules);
const staticDict = toDict(staticModules);

// Only filenames present in BOTH gifs/ and static/ are eligible. Sorted so the
// order is identical for every build, which keeps the rotation in sync across
// all clients.
export const commonKeys = Object.keys(gifDict)
  .filter((k) => staticDict[k])
  .sort();

// Deterministic PRNG so the shuffle and per-segment durations are reproducible
// (no Math.random). Same seed + same clock => same background everywhere.
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rng = mulberry32(SCHEDULE_SEED);

// Fisher–Yates shuffle of the key indices => deterministic display order.
const order = Array.from({ length: commonKeys.length }, (_, i) => i);
for (let i = order.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1));
  [order[i], order[j]] = [order[j], order[i]];
}

const MINUTE_MS = 60 * 1000;
const SPAN = MAX_INTERVAL_MIN - MIN_INTERVAL_MIN + 1;

// Prefix sums of each segment's duration (1–5 min). cumulativeMs[p] is the end
// boundary of segment p within one full cycle.
const cumulativeMs: number[] = [];
let acc = 0;
for (let p = 0; p < order.length; p++) {
  const minutes = MIN_INTERVAL_MIN + Math.floor(rng() * SPAN);
  acc += minutes * MINUTE_MS;
  cumulativeMs.push(acc);
}

export const cycleMs = cumulativeMs[cumulativeMs.length - 1] ?? 0;

// Flat view of the rotation, mainly for tests/inspection.
export const segments = order.map((keyIndex, p) => ({
  key: commonKeys[keyIndex],
  startMs: p === 0 ? 0 : cumulativeMs[p - 1],
  durationMs: cumulativeMs[p] - (p === 0 ? 0 : cumulativeMs[p - 1]),
}));

/**
 * The background for a given wall-clock instant. Pure: identical input => identical
 * output, and identical across clients. `msUntilNext` is how long until the next
 * segment boundary, so callers can schedule the next change exactly on time.
 */
export const getBackgroundAt = (
  nowMs: number,
): { key: string; msUntilNext: number } => {
  if (cycleMs === 0) return { key: "", msUntilNext: Infinity };

  const offset = ((nowMs % cycleMs) + cycleMs) % cycleMs;
  let p = 0;
  while (p < cumulativeMs.length && cumulativeMs[p] <= offset) p++;

  return {
    key: commonKeys[order[p]],
    msUntilNext: cumulativeMs[p] - offset,
  };
};

/** Dynamically import the gif + static sources for a given key. */
export const loadBackground = async (
  key: string,
): Promise<{ gif: string; static: string }> => {
  const gifImport = gifModules[gifDict[key]] as () => Promise<string>;
  const staticImport = staticModules[staticDict[key]] as () => Promise<string>;
  const [gif, staticImg] = await Promise.all([gifImport(), staticImport()]);
  return { gif, static: staticImg };
};

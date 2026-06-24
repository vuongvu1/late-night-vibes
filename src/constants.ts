export const VOLUME_STEP = 10;
export const VIDEO_DOWN_TITLE = "Radio channel is down!";

// Background rotation: each segment lasts a deterministic 1–5 minutes so every
// visitor sees the same image at the same wall-clock moment. See
// components/Background/schedule.ts.
export const MIN_INTERVAL_MIN = 1;
export const MAX_INTERVAL_MIN = 5;
// Fixed seed for the deterministic shuffle + per-segment durations. Changing it
// reshuffles the global rotation for everyone.
export const SCHEDULE_SEED = 0x9e3779b9;
// Crossfade duration, matches the opacity transition in Background/style.module.css.
export const FADE_MS = 800;

// Phone/mobile layout breakpoint, mirroring the 600px @media value used in CSS.
export const MOBILE_BREAKPOINT = 600;

// Online-listener counter: a synced, deterministic random walk in [MIN, MAX]
// that steps every 10–30s. Same seed + same wall-clock => same count on every
// client, no server round-trip. See components/OnlineCounter/schedule.ts.
export const ONLINE_MIN = 1;
export const ONLINE_MAX = 5;
export const ONLINE_STEP_MIN_MS = 10_000;
export const ONLINE_STEP_MAX_MS = 30_000;
// Fixed seed for the deterministic walk + step durations. Changing it reshuffles
// the global sequence for everyone.
export const ONLINE_SEED = 0x1f123bb5;
// One cycle ≈ ONLINE_STEPS × ~20s ≈ 2.8h before the walk loops.
export const ONLINE_STEPS = 500;

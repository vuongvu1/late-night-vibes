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

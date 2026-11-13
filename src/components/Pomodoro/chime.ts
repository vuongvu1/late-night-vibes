// ponytail: synthesized bell via Web Audio, so no audio asset to ship. Swap
// for an mp3 through playSound() if a real bell sample is wanted.

// A struck bell's overtones are inharmonic (not whole multiples of the base
// note) — that's what makes it sound like metal rather than a beep.
// [ratio to the strike note, relative loudness, decay seconds]
const PARTIALS: [number, number, number][] = [
  [0.5, 0.5, 3.5], // hum, lingers longest
  [1, 1, 2.5], // strike note
  [1.19, 0.6, 2], // minor third — the "bell" colour
  [1.5, 0.4, 1.6],
  [2, 0.35, 1.3],
  [2.74, 0.25, 0.9],
  [4.07, 0.15, 0.5], // bright attack
];
const STRIKES = 3;
const GAP = 1.1; // seconds between strikes
const BASE_HZ = 660;

export function playChime() {
  if (typeof AudioContext === "undefined") return; // jsdom / very old browsers
  const ctx = new AudioContext();
  // Loud but no clipping when partials and strikes overlap.
  const out = ctx.createDynamicsCompressor();
  out.connect(ctx.destination);

  for (let s = 0; s < STRIKES; s++) {
    const t = ctx.currentTime + 0.05 + s * GAP;
    for (const [ratio, level, decay] of PARTIALS) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = BASE_HZ * ratio;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level * 0.6, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + decay);
    }
  }
  setTimeout(() => ctx.close(), (STRIKES * GAP + 4) * 1000);
}

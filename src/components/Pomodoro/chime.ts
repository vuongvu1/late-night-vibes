// ponytail: synthesized three-note chime via Web Audio, so no audio asset to
// ship. Swap for an mp3 through playSound() if a real bell sample is wanted.
export function playChime() {
  if (typeof AudioContext === "undefined") return; // jsdom / very old browsers
  const ctx = new AudioContext();
  [880, 660, 880].forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.35;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  });
  setTimeout(() => ctx.close(), 1500);
}

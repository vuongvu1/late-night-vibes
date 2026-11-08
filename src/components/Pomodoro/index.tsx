import { useEffect, useState } from "react";
import {
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SettingsIcon,
} from "../../assets/icons";
import Button from "../Button";
import { playChime } from "./chime";
import {
  type Cycle,
  DEFAULT_SETTINGS,
  nextPhase,
  type Phase,
  type PomodoroSettings,
} from "./phase";
import styles from "./style.module.css";

const MINUTE = 60_000;
const SETTINGS_KEY = "pomodoro-settings";
const KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof PomodoroSettings)[];

const LIMITS: Record<keyof PomodoroSettings, [min: number, max: number]> = {
  focus: [1, 180],
  short: [1, 60],
  long: [1, 90],
  rounds: [1, 12],
};
const FIELD_LABELS: Record<keyof PomodoroSettings, string> = {
  focus: "Focus (min)",
  short: "Short break (min)",
  long: "Long break (min)",
  rounds: "Rounds before long break",
};
const PHASE_LABELS: Record<Phase, string> = {
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};

const isValid = (key: keyof PomodoroSettings, value: unknown) =>
  Number.isInteger(value) &&
  (value as number) >= LIMITS[key][0] &&
  (value as number) <= LIMITS[key][1];

// Restore saved settings, falling back per field so one corrupt value can't
// break the timer.
const loadSettings = (): PomodoroSettings => {
  let stored: Partial<Record<string, unknown>> = {};
  try {
    stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") ?? {};
  } catch {}
  return Object.fromEntries(
    KEYS.map((k) => [
      k,
      isValid(k, stored[k]) ? stored[k] : DEFAULT_SETTINGS[k],
    ]),
  ) as unknown as PomodoroSettings;
};

const formatTime = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// Mounted while the timer is on; starts a focus round immediately. Unmounting
// (⏱ button / P) discards the session.
function Pomodoro() {
  const [settings, setSettings] = useState(loadSettings);
  const [cycle, setCycle] = useState<Cycle>({ phase: "focus", round: 1 });
  // Running ⇔ endAt !== null. Counting against a wall-clock deadline (not
  // decrementing per tick) keeps it accurate when the browser throttles
  // timers in a background tab.
  // ponytail: ticks are still throttled in a hidden *silent* tab (~1/min in
  // Chrome), so the chime could land late there; with the radio playing the
  // tab is audible and exempt. Schedule the chime on the AudioContext clock if
  // that ever matters.
  const [endAt, setEndAt] = useState<number | null>(
    () => Date.now() + settings.focus * MINUTE,
  );
  const [pausedLeft, setPausedLeft] = useState(settings.focus * MINUTE);
  const [now, setNow] = useState(Date.now);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isRunning = endAt !== null;
  const left = isRunning ? Math.max(0, endAt - now) : pausedLeft;

  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t < endAt) return;
      // Phase over: ring, then roll straight into the next phase.
      playChime();
      const next = nextPhase(cycle, settings);
      setCycle(next);
      setEndAt(t + settings[next.phase] * MINUTE);
    }, 250);
    return () => clearInterval(id);
  }, [endAt, cycle, settings]);

  const togglePause = () => {
    if (isRunning) {
      setPausedLeft(left);
      setEndAt(null);
    } else {
      setNow(Date.now());
      setEndAt(Date.now() + pausedLeft);
    }
  };

  const reset = () => {
    setCycle({ phase: "focus", round: 1 });
    setEndAt(null);
    setPausedLeft(settings.focus * MINUTE);
  };

  // New values apply from the next phase (or the next reset), so editing
  // never yanks the clock mid-round.
  const updateSetting = (key: keyof PomodoroSettings, value: number) => {
    if (!isValid(key, value)) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  return (
    <section
      className={styles.pomodoro}
      aria-label="Pomodoro timer"
      data-open={isSettingsOpen}
    >
      <div className={styles.clock} role="timer">
        {formatTime(left)}
      </div>
      <div className={styles.label}>
        {PHASE_LABELS[cycle.phase]}
        {cycle.phase === "focus" &&
          ` · Round ${cycle.round}/${settings.rounds}`}
      </div>
      <div className={styles.controls}>
        <Button
          icon={isRunning ? <PauseIcon /> : <PlayIcon />}
          onClick={togglePause}
          aria-label={isRunning ? "Pause timer" : "Resume timer"}
        />
        <Button icon={<ResetIcon />} onClick={reset} aria-label="Reset timer" />
        <Button
          icon={<SettingsIcon />}
          onClick={() => setIsSettingsOpen((open) => !open)}
          aria-label="Timer settings"
          aria-expanded={isSettingsOpen}
        />
      </div>
      {isSettingsOpen && (
        // stopPropagation so typing/arrow keys don't fire global shortcuts
        <form
          className={styles.settings}
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {KEYS.map((key) => (
            <label key={key} className={styles.field}>
              {FIELD_LABELS[key]}
              <input
                type="number"
                inputMode="numeric"
                min={LIMITS[key][0]}
                max={LIMITS[key][1]}
                step={1}
                defaultValue={settings[key]}
                onChange={(e) => updateSetting(key, e.target.valueAsNumber)}
              />
            </label>
          ))}
        </form>
      )}
    </section>
  );
}

export default Pomodoro;

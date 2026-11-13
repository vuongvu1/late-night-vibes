import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from "../../assets/icons";
import { SOUNDS } from "../../store";
import { playSound } from "../../utils";
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
const NUMBER_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof PomodoroSettings)[];

/** Phase lengths/rounds plus whether the next phase starts by itself. */
type Settings = PomodoroSettings & { autoStart: boolean };

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
const PHASES: { phase: Phase; label: string }[] = [
  { phase: "focus", label: "Focus" },
  { phase: "short", label: "Short break" },
  { phase: "long", label: "Long break" },
];

const isValid = (key: keyof PomodoroSettings, value: unknown) =>
  Number.isInteger(value) &&
  (value as number) >= LIMITS[key][0] &&
  (value as number) <= LIMITS[key][1];

// Restore saved settings, falling back per field so one corrupt value can't
// break the timer.
const loadSettings = (): Settings => {
  let stored: Partial<Record<string, unknown>> = {};
  try {
    stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") ?? {};
  } catch {}
  const numbers = Object.fromEntries(
    NUMBER_KEYS.map((k) => [
      k,
      isValid(k, stored[k]) ? stored[k] : DEFAULT_SETTINGS[k],
    ]),
  ) as unknown as PomodoroSettings;
  return { ...numbers, autoStart: stored.autoStart === true };
};

const formatTime = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// Running ⇔ endAt !== null. Counting against a wall-clock deadline (not
// decrementing per tick) keeps it accurate when the browser throttles timers
// in a background tab.
// ponytail: ticks are still throttled in a hidden *silent* tab (~1/min in
// Chrome), so the chime could land late there; with the radio playing the tab
// is audible and exempt. Schedule the chime on the AudioContext clock if that
// ever matters.
interface Timer {
  cycle: Cycle;
  endAt: number | null;
  pausedLeft: number;
}

/** `cycle` at full length, either paused or already counting down. */
const loadPhase = (cycle: Cycle, settings: Settings, run: boolean): Timer => {
  const ms = settings[cycle.phase] * MINUTE;
  return { cycle, pausedLeft: ms, endAt: run ? Date.now() + ms : null };
};

// Mounted while the timer is on (⏱ button / P); opens paused on focus round 1.
// Unmounting discards the session.
function Pomodoro() {
  const [settings, setSettings] = useState(loadSettings);
  const [timer, setTimer] = useState(() =>
    loadPhase({ phase: "focus", round: 1 }, settings, false),
  );
  const [now, setNow] = useState(Date.now);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { cycle, endAt } = timer;
  const isRunning = endAt !== null;
  const left = isRunning ? Math.max(0, endAt - now) : timer.pausedLeft;

  useEffect(() => {
    if (timer.endAt === null) return;
    const deadline = timer.endAt;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t < deadline) return;
      // Phase over: ring, then load the next phase (running only if auto-start).
      playChime();
      setTimer(
        loadPhase(
          nextPhase(timer.cycle, settings),
          settings,
          settings.autoStart,
        ),
      );
    }, 250);
    return () => clearInterval(id);
  }, [timer, settings]);

  const togglePause = () => {
    playSound(SOUNDS.play);
    if (isRunning) {
      setTimer({ ...timer, endAt: null, pausedLeft: left });
    } else {
      setNow(Date.now());
      setTimer({ ...timer, endAt: Date.now() + timer.pausedLeft });
    }
  };

  // Any tab — the current one too — resets that phase to full length, paused.
  // The round is kept; only finishing or skipping a focus round advances it.
  const selectPhase = (phase: Phase) => {
    playSound(SOUNDS.action);
    setTimer(loadPhase({ phase, round: cycle.round }, settings, false));
  };

  // Skip: same transition as a finished phase, minus the chime.
  const skip = () => {
    playSound(SOUNDS.channel);
    setTimer(
      loadPhase(nextPhase(cycle, settings), settings, settings.autoStart),
    );
  };

  // reset() drops edits left over from a dialog closed without saving
  // (Esc / backdrop), so the fields always open showing the saved settings.
  const openSettings = () => {
    playSound(SOUNDS.action);
    formRef.current?.reset();
    dialogRef.current?.showModal();
  };

  // Save applies everything at once and resets the current phase to its
  // (new) full length, paused. Native min/max/required already blocked
  // invalid values before submit fires.
  const saveSettings = (e: FormEvent<HTMLFormElement>) => {
    playSound(SOUNDS.action);
    const data = new FormData(e.currentTarget);
    const next = {
      ...Object.fromEntries(NUMBER_KEYS.map((k) => [k, Number(data.get(k))])),
      autoStart: data.get("autoStart") === "on",
    } as Settings;
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    // Clamp so lowering "rounds" never shows e.g. "Round 4/2".
    const round = Math.min(cycle.round, next.rounds);
    setTimer(loadPhase({ phase: cycle.phase, round }, next, false));
  };

  // Fills the fields with the defaults; Save still applies them (Esc cancels).
  const fillDefaults = () => {
    playSound(SOUNDS.action);
    const fields = formRef.current?.elements;
    if (!fields) return;
    for (const key of NUMBER_KEYS)
      (fields.namedItem(key) as HTMLInputElement).value = String(
        DEFAULT_SETTINGS[key],
      );
    (fields.namedItem("autoStart") as HTMLInputElement).checked = false;
  };

  return (
    <section className={styles.pomodoro} aria-label="Pomodoro timer">
      <div className={styles.tabs}>
        {PHASES.map(({ phase, label }) => (
          <button
            key={phase}
            type="button"
            className={styles.tab}
            aria-pressed={cycle.phase === phase}
            onClick={() => selectPhase(phase)}
            onKeyDown={(e) => e.key === " " && e.stopPropagation()}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.clock} role="timer">
        {formatTime(left)}
      </div>
      <div className={styles.label}>
        Round {cycle.round}/{settings.rounds}
      </div>
      <div className={styles.controls}>
        <Button
          icon={isRunning ? <PauseIcon /> : <PlayIcon />}
          onClick={togglePause}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        />
        <Button icon={<NextIcon />} onClick={skip} aria-label="Next phase" />
        <Button
          icon={<SettingsIcon />}
          onClick={openSettings}
          aria-label="Timer settings"
        />
      </div>

      {/* Native modal: top layer (nothing behind shifts), Esc closes for free.
          Clicking the backdrop lands on the <dialog> itself → close. */}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Timer settings"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        // stopPropagation so typing/arrow keys don't fire global shortcuts
        onKeyDown={(e) => e.stopPropagation()}
      >
        <form
          ref={formRef}
          method="dialog"
          className={styles.settings}
          onSubmit={saveSettings}
        >
          <h2 className={styles.dialogTitle}>Timer settings</h2>
          {NUMBER_KEYS.map((key) => (
            <label key={key} className={styles.field}>
              {FIELD_LABELS[key]}
              <input
                name={key}
                type="number"
                inputMode="numeric"
                required
                min={LIMITS[key][0]}
                max={LIMITS[key][1]}
                step={1}
                defaultValue={settings[key]}
              />
            </label>
          ))}
          <label className={styles.field}>
            Auto-start next phase
            <input
              name="autoStart"
              type="checkbox"
              defaultChecked={settings.autoStart}
            />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.done}
              onClick={fillDefaults}
            >
              Reset to defaults
            </button>
            <button type="submit" className={styles.done}>
              Save
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

export default Pomodoro;

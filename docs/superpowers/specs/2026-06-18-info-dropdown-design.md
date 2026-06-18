# Info dropdown — About + Shortcuts

**Date:** 2026-06-18
**Status:** Approved design

## Problem

Keyboard shortcut hints are scattered across the per-button tooltips in
`ControlPanel` (`Press [Space] to Play/Pause`, `Press [R] to play a random
channel`, …). The full set of shortcuts is also declared independently in
`App.tsx` via `useKeyPress`. There is no single place a user can see what the app
is or what every shortcut does, and the shortcut list lives in two places that
can silently drift apart.

## Goal

Group all of this into a single, discoverable surface: an **info button** that
toggles a **dropdown** with sections:

- **About** — a short blurb describing the app.
- **Shortcuts** — the full keyboard shortcut list.

The dropdown must be easy to extend with more sections later.

## Non-goals

- No GitHub link, credits, or settings in this iteration (About is a short blurb
  only).
- No changes to what the shortcuts actually do — only where they are declared and
  displayed.
- No redesign of the existing panels (Chat / Mixer).

## Design

### 1. Shared shortcut config (single source of truth)

New module `src/shortcuts.ts` holds the canonical, ordered shortcut list — one
entry per key code:

```ts
export const SHORTCUTS = [
  { code: "Space",      keyLabel: "Space", description: "Play / Pause" },
  { code: "KeyR",       keyLabel: "R",     description: "Random channel" },
  { code: "ArrowRight", keyLabel: "→",     description: "Next channel" },
  { code: "ArrowLeft",  keyLabel: "←",     description: "Previous channel" },
  { code: "ArrowUp",    keyLabel: "↑",     description: "Volume up" },
  { code: "ArrowDown",  keyLabel: "↓",     description: "Volume down" },
  { code: "KeyF",       keyLabel: "F",     description: "Toggle fullscreen" },
  { code: "KeyC",       keyLabel: "C",     description: "Toggle chat" },
  { code: "KeyM",       keyLabel: "M",     description: "Toggle sound mixer" },
] as const;

export type ShortcutCode = (typeof SHORTCUTS)[number]["code"];
```

- `code` — the `KeyboardEvent.code` value `useKeyPress` matches on.
- `keyLabel` — what the dropdown renders inside the key-cap (e.g. `→`, `Space`).
- `description` — human label, shown in the dropdown and reused as the button
  tooltip text (see §4).

**Why a flat list (one entry per code), not grouped rows:** keeps the binding map
and the display list 1:1, so the type check in §`App.tsx` can guarantee
completeness. Volume up/down show as two honest rows rather than a combined
`↑ / ↓` row that would map one description to two different handlers.

### `App.tsx` wiring

Handlers stay in `App.tsx` because they depend on live state (`isLoading`,
`volume`, the toggles). The map is constrained so the compiler enforces that the
handler set and the shortcut list never drift:

```ts
const shortcutHandlers = {
  Space: () => !isLoading && togglePlaying(),
  KeyR: selectRandomChannel,
  ArrowRight: selectNextChannel,
  ArrowLeft: selectPreviousChannel,
  ArrowUp: () => setVolume(volume < 100 ? volume + VOLUME_STEP : volume),
  ArrowDown: () => setVolume(volume > 0 ? volume - VOLUME_STEP : volume),
  KeyF: toggleFullscreen,
  KeyC: toggleChat,
  KeyM: toggleMixer,
} satisfies Record<ShortcutCode, () => void>;

useKeyPress(shortcutHandlers);
```

If a `SHORTCUTS` entry is added without a handler (or a handler is added without
a `SHORTCUTS` entry / with a typo'd code), `pnpm type-check` fails. `useKeyPress`
itself is unchanged — it still accepts `Record<string, () => void>`.

### 2. `InfoPanel` component

New folder `src/components/InfoPanel/` (`index.tsx`, `style.module.css`,
`index.test.tsx`), re-exported from `src/components/index.ts`.

- Built on **Radix Popover** — new dependency `@radix-ui/react-popover` (same
  family as the already-used `@radix-ui/react-tooltip`). Gives anchored
  positioning, click-outside + `Esc` to close, and focus management for free.
- `Popover.Trigger` wraps the info icon button.
- `Popover.Content` renders the sections, stacked vertically. Structure the
  content so adding a section later is just appending another titled block:
  - **About** — section title + short blurb paragraph. Draft copy: *"Late Night
    Vibes — live lofi YouTube radio with an ambient sound mixer and a global chat.
    Pick a channel, mix in some rain, and settle in."* (final wording tweakable).
  - **Shortcuts** — section title + a list built by mapping over `SHORTCUTS`,
    each row a key-cap (`keyLabel`) next to its `description`.

The component imports `SHORTCUTS` directly; it takes no props related to the
shortcut data.

### 3. Info button placement

- Fixed **top-left** corner: `top: 2rem; left: 2rem` (mirrors `OnlineCounter`'s
  fixed top-right at `top: 6rem; right: 2rem`, so the two don't collide).
- New `InfoIcon` SVG asset in `src/assets/icons/`, exported from
  `src/assets/icons/index.ts` following the existing icon export pattern.
- Rendered in `App.tsx` in the top-level area (alongside / near where
  `OnlineCounter` is mounted). Uses the shared `Button` component for visual
  consistency with the control row.

### 4. Tooltips on control buttons

Strip the `Press [X] to …` text from every `ControlPanel` tooltip and the volume
tooltip; keep a plain action description so hovering still tells you what a button
does:

| Button     | Old tooltip                              | New tooltip        |
| ---------- | ---------------------------------------- | ------------------ |
| Play/Pause | `Press [Space] to Play/Pause`            | `Play / Pause`     |
| Shuffle    | `Press [R] to play a random channel`     | `Random channel`   |
| Previous   | `Press [ArrowLeft] to play previous …`   | `Previous channel` |
| Next       | `Press [ArrowRight] to play next …`      | `Next channel`     |
| Fullscreen | `Press [F] to toggle Fullscreen`         | `Toggle fullscreen`|
| Chat       | `Press [C] to toggle Chat/Comments`      | `Toggle chat`      |
| Mixer      | `Press [M] to toggle Sound Mixer`        | `Toggle sound mixer`|
| Volume     | `Press [ArrowUp/Down] to control volume` | `Volume`           |

The `Loading...` state on the Play button tooltip is preserved.

These labels match the `description` field in `SHORTCUTS`, so the same wording
appears in the tooltip and the dropdown.

## Components / boundaries

- `src/shortcuts.ts` — data only; no React. Depended on by `App.tsx` (bindings)
  and `InfoPanel` (display).
- `InfoPanel` — self-contained; reads `SHORTCUTS`, renders About + Shortcuts.
  Knows nothing about playback state.
- `App.tsx` — composition: mounts the info button + popover, wires the typed
  handler map.

## Testing

- **`InfoPanel`**: closed by default; clicking the trigger opens the popover;
  About blurb renders; every `SHORTCUTS` entry renders a row with its `keyLabel`
  and `description`; closes on outside interaction.
- **`ControlPanel`**: update any assertions that reference the old `Press [X]`
  tooltip strings to the new labels.
- Existing `useKeyPress` tests remain valid (its signature is unchanged).

## Dependencies

- Add `@radix-ui/react-popover`.

## Out of scope / future

- Additional dropdown sections (credits, links, settings) — the section layout is
  built to accommodate them.
- Mobile-specific placement tuning if the top-left button crowds small screens.

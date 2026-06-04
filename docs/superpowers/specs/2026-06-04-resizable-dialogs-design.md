# Resizable, position-persistent dialogs — design

**Date:** 2026-06-04
**Status:** Approved (ready for implementation plan)

## Goal

Make the **Chat** and **Sound Mixer** dialogs resizable on desktop, with both
their **position and size persisted to localStorage**. On mobile, both dialogs
become a fixed full-band layout occupying the space **below the title
(`NeonText`) and above the action buttons (`ControlPanel`)**, with no
dragging/resizing.

## Context

- Both panels render through the shared `DraggablePanel`
  (`src/components/DraggablePanel/index.tsx`), which uses the `useDraggable`
  hook (`src/hooks/useDraggable.ts`) to own position and persist `{x, y}` on
  mouse-up.
- `ChatPanel` (`src/components/ChatPanel`) currently has **no mobile layout**.
- `SoundEffectsPanel` (`src/components/SoundEffectsPanel`) currently has a
  **mobile bottom-sheet** (`@media (max-width: 600px)` → pinned to bottom,
  `70dvh`). This design **replaces** that with the unified full-band layout.
- **Convention (global.css:1-7):** responsive layout is intentionally
  CSS-only (no `matchMedia`) so the jsdom test suite stays green. The mobile
  layout in this design stays pure CSS. The only sizing-related JS is a
  `ResizeObserver` that persists desktop resizes, guarded by
  `window.innerWidth` (not `matchMedia`).
- **jsdom has no `ResizeObserver`** — `src/test/setup.ts` only registers
  cleanup. A no-op mock must be added there, since several tests render through
  `DraggablePanel`.
- Mobile breakpoint is **600px** throughout the app.

## Design

### 1. Resize mechanism (desktop)

Use the browser-native **`resize: both`** on each panel, styled with a
bottom-right grip (a `::after` triangle for affordance; the native resizer
provides the hit area). Native CSS `resize` requires the element's computed
`overflow` to be non-`visible`:

- `ChatPanel.chatContainer` already has `overflow: hidden` — OK.
- `SoundEffectsPanel.panel` currently has default (`visible`) overflow — add
  `overflow: hidden` so resize is enabled (the inner `.scrollArea` keeps its
  own scroll).

### 2. New hook: `useResizable(ref, storageKey)`

`src/hooks/useResizable.ts`. One clear purpose: persist a panel's size.

- **Input:** the panel's DOM ref (shared with `useDraggable`) and a
  `storageKey`.
- **On mount:** load `{ width, height }` from `localStorage[storageKey]`
  (same defensive JSON parsing as `loadPosition` — validate both are numbers,
  ignore on error). Return it as `size` (or `undefined` → panel falls back to
  its CSS default size).
- **Effect:** attach a `ResizeObserver` to `ref.current`. On callback:
  - **Skip the first (synthetic) callback** — ResizeObserver fires once
    immediately on observe; we don't want to persist the freshly-loaded size.
  - **Mobile guard:** only persist when `window.innerWidth > 600`
    (`MOBILE_BREAKPOINT`). This prevents the CSS-forced mobile dimensions from
    overwriting the stored desktop size. Uses `innerWidth`, not `matchMedia`,
    so jsdom (default 1024) stays on the desktop path.
  - **Debounce** writes (~150ms) so a drag-resize doesn't spam localStorage.
  - Persist `{ width, height }` (rounded) from `getBoundingClientRect`.
- **Cleanup:** disconnect the observer and clear any pending debounce timer.

### 3. `DraggablePanel` composition

`DraggablePanel` composes both hooks over **one shared ref**:

```tsx
const { position, isDragging, dragRef, handleMouseDown } = useDraggable({ storageKey: positionKey, initialX, initialY });
const { size } = useResizable(dragRef, sizeKey);
```

It applies inline style `left/top` (position) and `width/height` (size, only
when loaded). `DraggablePanel` gets an explicit new prop **`sizeStorageKey`**,
passed by each panel; the existing `storageKey` prop (position) stays as today.

### 4. Storage keys

Position and size are kept as **separate records** so the two hooks stay
independent and old `{x, y}` records keep working unchanged:

| Panel  | Position key (existing) | Size key (new)      |
| ------ | ----------------------- | ------------------- |
| Chat   | `chat-panel-position`   | `chat-panel-size`   |
| Mixer  | `mixer-panel-position`  | `mixer-panel-size`  |

### 5. Size constraints / defaults (desktop CSS)

| Panel | Default      | Min       | Max             |
| ----- | ------------ | --------- | --------------- |
| Chat  | `400×400`    | `300×280` | `90vw × 85vh`   |
| Mixer | `350×420`    | `280×220` | `90vw × 85vh`   |

- Chat: replace `width: 100%; max-width: 400px; height: 400px` with
  `width: 400px; height: 400px` + the min/max above + `resize: both`.
- Mixer: replace `width: 350px; max-height: 60vh` with `width: 350px;
  height: 420px` + min/max + `overflow: hidden` + `resize: both`. `.scrollArea`
  keeps `flex: 1`.

### 6. Mobile layout (`@media (max-width: 600px)`, both panels)

Pure CSS. `!important` overrides the inline drag position and size. Replaces the
mixer's bottom-sheet block:

```css
@media (max-width: 600px) {
  .chatContainer, /* and .panel */ {
    top: var(--mobile-dialog-top) !important;        /* below the title */
    bottom: var(--mobile-dialog-bottom) !important;  /* above the controls */
    left: var(--spacing-sm) !important;
    right: var(--spacing-sm) !important;
    width: auto !important;
    height: auto !important;
    max-width: none !important;
    max-height: none !important;
    resize: none !important;
    border-radius: var(--border-radius-panel);
  }
}
```

New tunable variables in `global.css` (approximate per the chosen approach;
refined during verification):

```css
--mobile-dialog-top: 6.5rem;                                      /* clears NeonText */
--mobile-dialog-bottom: calc(5rem + env(safe-area-inset-bottom)); /* clears ControlPanel */
```

### 7. Testing

- **`src/test/setup.ts`:** add a no-op `ResizeObserver` mock
  (`observe`/`unobserve`/`disconnect` no-ops) on `globalThis` so panels render
  in jsdom.
- **`src/hooks/useResizable.test.ts`** (new): loads persisted size from
  localStorage; persists `{width, height}` on an observed resize (with a
  controllable ResizeObserver mock + fake timers for the debounce); skips
  persistence when `window.innerWidth <= 600`; skips the initial callback.
- Existing `ChatPanel` and `SoundEffectsPanel` tests must keep passing.

## Trade-offs / out of scope

- Native resize is **mouse-only and corner-only** — consistent with the
  existing mouse-only drag. No keyboard resize.
- Mobile insets are **fixed constants** (not measured), so they are tuned to
  clear the title/controls rather than tracking their exact heights.
- No change to the position-persistence behavior or the `useDraggable` hook
  beyond sharing its ref.

## Verification

- `npx tsc --noEmit`, `npx eslint .`, `npx vitest run`.
- Manual: resize each panel on desktop, reload → size + position restored.
  Narrow viewport < 600px → both panels snap to the full band between title and
  controls, no resize grip; widen again → desktop size restored (mobile
  dimensions were not persisted).

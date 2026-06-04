# Resizable, position-persistent dialogs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Chat and Sound Mixer panels resizable on desktop with size persisted to localStorage, and give both a unified fixed full-band layout on mobile (below the title, above the controls).

**Architecture:** Both panels render through `DraggablePanel`, which already uses `useDraggable` for position. Add a sibling `useResizable` hook that shares the same DOM ref: it restores the saved size imperatively in a layout effect and persists size changes via a `ResizeObserver` (debounced, desktop-only). Resize itself is the browser-native CSS `resize: both`. Mobile layout is pure CSS (`@media (max-width: 600px)`) using two new inset variables.

**Tech Stack:** React 19 + TypeScript, CSS Modules, Vitest + Testing Library (jsdom). Spec: `docs/superpowers/specs/2026-06-04-resizable-dialogs-design.md`.

---

### Task 1: Add `MOBILE_BREAKPOINT` constant and a jsdom `ResizeObserver` mock

`useResizable` (Task 2) reads `window.innerWidth` against the mobile breakpoint and creates a `ResizeObserver`. jsdom implements neither a shared breakpoint constant nor `ResizeObserver`, and once `DraggablePanel` uses the hook (Task 3) the existing `ChatPanel` / `SoundEffectsPanel` tests would throw `ResizeObserver is not defined`. This task lays that groundwork first.

**Files:**
- Modify: `src/constants.ts`
- Modify: `src/test/setup.ts`

- [ ] **Step 1: Add the breakpoint constant**

Append to `src/constants.ts`:

```ts
// Phone/mobile layout breakpoint, mirroring the 600px @media value used in CSS.
export const MOBILE_BREAKPOINT = 600;
```

- [ ] **Step 2: Add a no-op `ResizeObserver` to the test setup**

Replace the entire contents of `src/test/setup.ts` with:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom doesn't implement ResizeObserver, which the panels rely on (via
// useResizable). Provide a no-op so components render in tests. The
// useResizable unit test overrides this with a controllable mock.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Verify the existing suite is still green**

Run: `npx vitest run`
Expected: PASS (same tests as before; the new mock is inert until used).

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/constants.ts src/test/setup.ts
git commit -m "chore: add MOBILE_BREAKPOINT and jsdom ResizeObserver mock"
```

---

### Task 2: Create the `useResizable` hook (TDD)

Restores a saved size onto the element on mount and persists size changes. Pairs with `useDraggable` over one shared ref: `useDraggable` owns position, this owns size. Persistence is skipped on mobile widths so the CSS-pinned mobile size never overwrites the stored desktop size.

**Files:**
- Create: `src/hooks/useResizable.ts`
- Test: `src/hooks/useResizable.test.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useResizable.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useResizable } from "./useResizable";

// Controllable ResizeObserver: capture the callback so tests can fire it.
let fireResize: (() => void) | undefined;

class ControllableResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    fireResize = () => cb([], this as unknown as ResizeObserver);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("useResizable", () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    fireResize = undefined;
    vi.stubGlobal("ResizeObserver", ControllableResizeObserver);
    el = document.createElement("div");
    // jsdom returns zeros for getBoundingClientRect; stub a concrete size.
    el.getBoundingClientRect = () => ({ width: 640, height: 480 }) as DOMRect;
    window.innerWidth = 1024; // desktop by default
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("restores the persisted size onto the element on mount", () => {
    localStorage.setItem(
      "panel-size",
      JSON.stringify({ width: 500, height: 350 }),
    );
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));
    expect(el.style.width).toBe("500px");
    expect(el.style.height).toBe("350px");
  });

  it("does nothing on mount when no size is stored", () => {
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));
    expect(el.style.width).toBe("");
    expect(el.style.height).toBe("");
  });

  it("persists the element size on resize (ignoring the initial callback)", () => {
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));

    fireResize?.(); // synthetic initial callback — ignored
    fireResize?.(); // a real user resize
    vi.advanceTimersByTime(200); // flush the debounce

    expect(JSON.parse(localStorage.getItem("panel-size")!)).toEqual({
      width: 640,
      height: 480,
    });
  });

  it("does not persist size on mobile widths", () => {
    window.innerWidth = 500;
    const ref = { current: el };
    renderHook(() => useResizable(ref, "panel-size"));

    fireResize?.(); // initial — ignored
    fireResize?.(); // would persist, but mobile guard blocks it
    vi.advanceTimersByTime(200);

    expect(localStorage.getItem("panel-size")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useResizable.test.ts`
Expected: FAIL — cannot resolve `./useResizable` (module does not exist yet).

- [ ] **Step 3: Write the hook**

Create `src/hooks/useResizable.ts`:

```ts
import { useLayoutEffect, RefObject } from "react";
import { MOBILE_BREAKPOINT } from "../constants";

interface Size {
  width: number;
  height: number;
}

const SIZE_PERSIST_DEBOUNCE_MS = 150;

const loadSize = (key: string): Size | undefined => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed.width === "number" &&
        typeof parsed.height === "number"
      ) {
        return parsed as Size;
      }
    }
  } catch {
    // ignore malformed JSON
  }
  return undefined;
};

/**
 * Persists a panel's size to localStorage and restores it on mount. Pairs with
 * useDraggable over the same DOM ref: useDraggable owns position, this owns
 * size. The size is applied imperatively (not via React's style prop) so the
 * browser's native resize and React re-renders don't fight over it.
 *
 * Desktop-only: the ResizeObserver skips persistence on mobile widths, where
 * CSS pins the panel — so the stored desktop size is never clobbered. Uses
 * window.innerWidth (not matchMedia) to keep the jsdom suite green.
 */
export const useResizable = (
  ref: RefObject<HTMLElement | null>,
  storageKey?: string,
) => {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !storageKey) return;

    const saved = loadSize(storageKey);
    if (saved) {
      el.style.width = `${saved.width}px`;
      el.style.height = `${saved.height}px`;
    }

    let isInitialCallback = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const observer = new ResizeObserver(() => {
      // ResizeObserver fires once on observe(); ignore that synthetic call so
      // we don't re-persist the size we just restored.
      if (isInitialCallback) {
        isInitialCallback = false;
        return;
      }
      // On mobile the size is CSS-controlled; don't overwrite the desktop size.
      if (window.innerWidth <= MOBILE_BREAKPOINT) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }),
        );
      }, SIZE_PERSIST_DEBOUNCE_MS);
    });

    observer.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, storageKey]);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useResizable.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Export the hook**

In `src/hooks/index.ts`, add after the `useDraggable` export line:

```ts
export { useResizable } from "./useResizable";
```

- [ ] **Step 6: Verify types and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/hooks/useResizable.ts src/hooks/useResizable.test.ts src/hooks/index.ts
git commit -m "feat: add useResizable hook for persisting panel size"
```

---

### Task 3: Wire `useResizable` into `DraggablePanel` and both panels

Add a `sizeStorageKey` prop to `DraggablePanel`, call `useResizable` with the shared `dragRef`, and have each panel pass its size key. `DraggablePanel`'s inline `style` keeps owning only `left`/`top`; width/height are set imperatively by the hook so React re-renders during drag don't reset them.

**Files:**
- Modify: `src/components/DraggablePanel/index.tsx`
- Modify: `src/components/ChatPanel/ChatPanel.tsx:150-154`
- Modify: `src/components/SoundEffectsPanel/index.tsx:25-31`

- [ ] **Step 1: Update `DraggablePanel`**

Replace the entire contents of `src/components/DraggablePanel/index.tsx` with:

```tsx
import React from "react";
import { useDraggable, useResizable } from "../../hooks";
import styles from "./style.module.css";

interface DraggablePanelProps {
  /** localStorage key used to persist the panel's position. */
  storageKey: string;
  /** localStorage key used to persist the panel's size. */
  sizeStorageKey: string;
  initialX?: number;
  initialY?: number;
  /** Panel-specific class (size, background, position context). */
  className?: string;
  /**
   * Render the panel body. Receives the drag handler to attach to whatever
   * element should act as the drag handle (typically the header).
   */
  children: (
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void,
  ) => React.ReactNode;
}

/**
 * Shared wrapper for the draggable Chat and Sound Mixer panels: owns the drag
 * state/positioning, size persistence, and key-event isolation, leaving each
 * panel to render its own header and content. Drag and native resize are
 * desktop-only; on mobile the panels are pinned as a fixed full-band dialog via
 * CSS, which overrides the inline position and size.
 */
const DraggablePanel: React.FC<DraggablePanelProps> = ({
  storageKey,
  sizeStorageKey,
  initialX,
  initialY,
  className,
  children,
}) => {
  const { position, isDragging, dragRef, handleMouseDown } = useDraggable({
    storageKey,
    initialX,
    initialY,
  });
  useResizable(dragRef, sizeStorageKey);

  return (
    <div
      ref={dragRef}
      className={`${className ?? ""} ${isDragging ? styles.dragging : ""}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children(handleMouseDown)}
    </div>
  );
};

export default DraggablePanel;
```

- [ ] **Step 2: Pass the size key from `ChatPanel`**

In `src/components/ChatPanel/ChatPanel.tsx`, update the `DraggablePanel` opening tag (currently lines 150-154) to add `sizeStorageKey`:

```tsx
    <DraggablePanel
      storageKey="chat-panel-position"
      sizeStorageKey="chat-panel-size"
      initialX={20}
      initialY={window.innerHeight - 520} // Position near bottom but visible
      className={styles.chatContainer}
    >
```

- [ ] **Step 3: Pass the size key from `SoundEffectsPanel`**

In `src/components/SoundEffectsPanel/index.tsx`, update the `DraggablePanel` opening tag (currently lines 26-31) to add `sizeStorageKey`:

```tsx
    <DraggablePanel
      storageKey="mixer-panel-position"
      sizeStorageKey="mixer-panel-size"
      initialX={window.innerWidth - 370} // Near right edge
      initialY={100}
      className={styles.panel}
    >
```

- [ ] **Step 4: Verify tests and types pass**

Run: `npx vitest run`
Expected: PASS — all suites, including `ChatPanel` and `SoundEffectsPanel` (they render through `DraggablePanel`, which now calls `useResizable`; the no-op `ResizeObserver` mock from Task 1 keeps them green).

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/DraggablePanel/index.tsx src/components/ChatPanel/ChatPanel.tsx src/components/SoundEffectsPanel/index.tsx
git commit -m "feat: wire size persistence into DraggablePanel and panels"
```

---

### Task 4: Desktop resize + mobile band CSS for the Chat panel, plus shared inset variables

Add the two mobile inset variables to `global.css`, then make `.chatContainer` resizable on desktop (with min/max bounds) and pin it to the full band between title and controls on mobile.

**Files:**
- Modify: `src/global.css:91-92` (inside `:root`)
- Modify: `src/components/ChatPanel/styles.module.css:1-15` and end of file

- [ ] **Step 1: Add the mobile inset variables**

In `src/global.css`, inside `:root`, immediately after the `--touch-target-min` declaration (line 92), add:

```css
  /* Mobile dialog band: fixed panels sit below the title and above the
     controls. Approximate constants — tuned to clear NeonText / ControlPanel. */
  --mobile-dialog-top: 6.5rem;
  --mobile-dialog-bottom: calc(5rem + env(safe-area-inset-bottom));
```

- [ ] **Step 2: Make `.chatContainer` resizable with bounds**

In `src/components/ChatPanel/styles.module.css`, replace the `.chatContainer` rule (lines 1-15):

```css
.chatContainer {
  width: 100%;
  max-width: 400px;
  height: 400px;
  background: var(--background-panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color-subtle);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgb(0 0 0 / 50%);
  position: fixed;
  z-index: var(--z-index-draggable);
}
```

with:

```css
.chatContainer {
  width: 400px;
  height: 400px;
  min-width: 300px;
  min-height: 280px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--background-panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color-subtle);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgb(0 0 0 / 50%);
  position: fixed;
  z-index: var(--z-index-draggable);
  resize: both;
}
```

- [ ] **Step 3: Add the mobile full-band layout**

Append to the end of `src/components/ChatPanel/styles.module.css`:

```css
/* Phones: pin to a fixed band below the title and above the control bar.
   Drag/resize disabled; !important overrides the inline left/top and the
   imperative width/height set by the hooks. */
@media (max-width: 600px) {
  .chatContainer {
    top: var(--mobile-dialog-top) !important;
    bottom: var(--mobile-dialog-bottom) !important;
    left: var(--spacing-sm) !important;
    right: var(--spacing-sm) !important;
    width: auto !important;
    height: auto !important;
    max-width: none !important;
    max-height: none !important;
    resize: none !important;
  }
}
```

- [ ] **Step 4: Verify build and lint**

Run: `npx tsc --noEmit && npx eslint .`
Expected: no errors, no warnings.

Run: `npx vitest run src/components/ChatPanel/ChatPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/global.css src/components/ChatPanel/styles.module.css
git commit -m "feat: resizable chat panel + mobile full-band layout"
```

---

### Task 5: Desktop resize + mobile band CSS for the Sound Mixer panel

Make `.panel` resizable on desktop with bounds, and replace its existing bottom-sheet `@media` block with the unified full-band layout.

**Files:**
- Modify: `src/components/SoundEffectsPanel/style.module.css:1-14` and `:210-222`

- [ ] **Step 1: Make `.panel` resizable with bounds**

In `src/components/SoundEffectsPanel/style.module.css`, replace the `.panel` rule (lines 1-14):

```css
.panel {
  position: fixed;
  width: 350px;
  max-height: 60vh;
  background: var(--background-panel-strong);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color-subtle);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 10px 30px rgb(0 0 0 / 50%);
  display: flex;
  flex-direction: column;
  z-index: var(--z-index-draggable);
}
```

with:

```css
.panel {
  position: fixed;
  width: 350px;
  height: 420px;
  min-width: 280px;
  min-height: 220px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--background-panel-strong);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color-subtle);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 10px 30px rgb(0 0 0 / 50%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--z-index-draggable);
  resize: both;
}
```

- [ ] **Step 2: Replace the mobile block with the full-band layout**

In the same file, replace the existing mobile block (lines 210-222):

```css
/* Bottom sheet on phones: pin to the bottom edge, full width, drag disabled.
   !important overrides the inline left/top set by useDraggable. */
@media (max-width: 600px) {
  .panel {
    left: 0 !important;
    top: auto !important;
    right: 0;
    width: 100%;
    max-height: 70dvh;
    border-radius: var(--border-radius-panel) var(--border-radius-panel) 0 0;
    padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
  }
}
```

with:

```css
/* Phones: pin to a fixed band below the title and above the control bar,
   matching the chat panel. Drag/resize disabled; !important overrides the
   inline left/top and the imperative width/height set by the hooks. */
@media (max-width: 600px) {
  .panel {
    top: var(--mobile-dialog-top) !important;
    bottom: var(--mobile-dialog-bottom) !important;
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

- [ ] **Step 3: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npx eslint .`
Expected: no errors, no warnings.

Run: `npx vitest run src/components/SoundEffectsPanel/index.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/SoundEffectsPanel/style.module.css
git commit -m "feat: resizable mixer panel + unified mobile full-band layout"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full automated suite**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint .`
Expected: no errors, no warnings.

Run: `npx vitest run`
Expected: PASS — all suites including the new `useResizable` test.

- [ ] **Step 2: Production build sanity check**

Run: `npx vite build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Manual verification (desktop)**

Run: `npx vite dev`, open the app, then:
- Open the Chat panel (press `C`). Drag the bottom-right corner to resize. Reload the page → the panel reopens at the same **size and position**.
- Repeat for the Sound Mixer (press `M`), confirming `mixer-panel-size` / `mixer-panel-position` are saved independently of the chat keys (check `localStorage`).
- Confirm each panel cannot be resized smaller than its min (chat 300×280, mixer 280×220).

- [ ] **Step 4: Manual verification (mobile)**

In DevTools responsive mode, set the viewport width below 600px:
- Both panels snap to the fixed band — top below the `[Live #N]` title, bottom above the control buttons — spanning the width with small side gaps, no resize grip.
- Tune `--mobile-dialog-top` / `--mobile-dialog-bottom` in `src/global.css` if the panel overlaps the title or the controls; re-check at 360px and 600px widths.
- Widen back above 600px → the panel returns to its saved **desktop** size (confirming mobile dimensions were never persisted).

- [ ] **Step 5: Final commit (only if Step 4 required inset tuning)**

```bash
git add src/global.css
git commit -m "fix: tune mobile dialog band insets"
```

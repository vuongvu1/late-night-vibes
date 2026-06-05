import { type RefObject, useLayoutEffect } from "react";
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
      // Restore the saved size by writing to the DOM node directly. Refs are
      // React's sanctioned escape hatch for imperative DOM access.
      el.style.width = `${saved.width}px`;
      el.style.height = `${saved.height}px`;
    }

    const persistSize = () => {
      const rect = el.getBoundingClientRect();
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        }),
      );
    };

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
        persistSize();
        timer = undefined;
      }, SIZE_PERSIST_DEBOUNCE_MS);
    });

    observer.observe(el);

    return () => {
      if (timer) {
        clearTimeout(timer);
        persistSize(); // flush the pending write so the last resize isn't lost
      }
      observer.disconnect();
    };
  }, [ref, storageKey]);
};

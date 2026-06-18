import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseDraggableOptions {
  initialX?: number;
  initialY?: number;
  storageKey?: string;
}

const loadPosition = (
  key: string | undefined,
  fallback: { x: number; y: number },
) => {
  if (!key) return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.x === "number" && typeof parsed.y === "number") {
        return parsed as { x: number; y: number };
      }
    }
  } catch {
    // ignore
  }
  return fallback;
};

export const useDraggable = ({
  initialX = 20,
  initialY = 100,
  storageKey,
}: UseDraggableOptions = {}) => {
  const [position, setPosition] = useState(() =>
    loadPosition(storageKey, { x: initialX, y: initialY }),
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Pull the panel back inside the viewport. The drag handler only clamps while
  // a drag is in progress, so without this a panel positioned in a large window
  // (live, or restored from localStorage) strands off-screen once the window
  // shrinks. Runs on mount and on every window resize.
  const clampToViewport = useCallback(() => {
    const el = dragRef.current;
    if (!el) return;
    const maxX = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - el.offsetHeight);
    setPosition((prev) => {
      const x = Math.max(0, Math.min(prev.x, maxX));
      const y = Math.max(0, Math.min(prev.y, maxY));
      // Bail out when nothing moved so resize events don't churn renders.
      return x === prev.x && y === prev.y ? prev : { x, y };
    });
  }, []);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only allow dragging from the header/title area
    const target = e.target as HTMLElement;
    const isInteractiveElement =
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("input");

    if (isInteractiveElement) return;

    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;

      // Constrain to viewport
      const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 0);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (storageKey) {
        const rect = dragRef.current?.getBoundingClientRect();
        if (rect) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ x: rect.left, y: rect.top }),
          );
        }
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, storageKey]);

  // Clamp once on mount (a restored position may not fit the current viewport)
  // and on every window resize so the panel can never strand off-screen.
  useEffect(() => {
    clampToViewport();
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [clampToViewport]);

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
  };
};

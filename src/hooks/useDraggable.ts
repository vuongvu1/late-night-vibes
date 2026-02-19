import { useState, useRef, useEffect, MouseEvent } from "react";

interface UseDraggableOptions {
  initialX?: number;
  initialY?: number;
}

export const useDraggable = ({
  initialX = 20,
  initialY = 100,
}: UseDraggableOptions = {}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

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
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
  };
};

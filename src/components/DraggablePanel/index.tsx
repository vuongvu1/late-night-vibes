import React from "react";
import { useDraggable } from "../../hooks";
import styles from "./style.module.css";

interface DraggablePanelProps {
  /** localStorage key used to persist the panel's position. */
  storageKey: string;
  initialX?: number;
  initialY?: number;
  /** Panel-specific class (size, background, position context). */
  className?: string;
  /**
   * Render the panel body. Receives the drag handler to attach to whatever
   * element should act as the drag handle (typically the header).
   */
  children: (
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  ) => React.ReactNode;
}

/**
 * Shared wrapper for the draggable Chat and Sound Mixer panels: owns the drag
 * state/positioning and key-event isolation, leaving each panel to render its
 * own header and content. Dragging is desktop-only; on mobile the panels are
 * pinned as bottom sheets via CSS, which overrides the inline position.
 */
const DraggablePanel: React.FC<DraggablePanelProps> = ({
  storageKey,
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

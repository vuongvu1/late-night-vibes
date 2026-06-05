import type React from "react";
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

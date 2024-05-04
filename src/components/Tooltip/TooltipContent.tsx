import React from "react";
import {
  useMergeRefs,
  FloatingPortal,
  useTransitionStatus,
  FloatingContext,
} from "@floating-ui/react";
import { useTooltipContext, ContextType } from "./hooks/useTooltipContext";
import styles from "./style.module.css";

type MergedContextType = ContextType & FloatingContext;

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function TooltipContent({ style, ...props }, propRef) {
  const context = useTooltipContext() as MergedContextType;
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const { isMounted, status } = useTransitionStatus(context);

  if (!context.open || !isMounted) return null;

  return (
    <FloatingPortal>
      <div
        id="tooltip"
        data-status={status}
        ref={ref}
        style={{
          ...context.floatingStyles,
          ...style,
        }}
        className={styles.tooltip}
        {...context.getFloatingProps(props)}
      />
    </FloatingPortal>
  );
});

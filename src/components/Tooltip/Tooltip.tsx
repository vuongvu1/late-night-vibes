import * as React from "react";
import type { TooltipOptions } from "./type";
import { useTooltip } from "./hooks/useTooltip";
import { TooltipContext } from "./hooks/useTooltipContext";

/**
 * Tooltip component that wraps the trigger and content.
 * @docs https://floating-ui.com/docs/tooltip
 */
export function Tooltip({
  children,
  ...options
}: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);

  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  );
}

import React from "react";
import { useTooltip } from "./useTooltip";

export type ContextType = ReturnType<typeof useTooltip> | null;

export const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <Tooltip />");
  }

  return context;
};

import * as RadixTooltip from "@radix-ui/react-tooltip";
import styles from "./style.module.css";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

// A single RadixTooltip.Provider is mounted once at the app root (see App.tsx),
// so each Tooltip only needs to render a Root rather than its own Provider.
export const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={styles.content}
          sideOffset={10}
          collisionPadding={10}
        >
          <RadixTooltip.Arrow />
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};

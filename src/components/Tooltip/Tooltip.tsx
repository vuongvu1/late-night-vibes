import * as RadixTooltip from "@radix-ui/react-tooltip";
import styles from "./style.module.css";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

export const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <RadixTooltip.Provider delayDuration={200}>
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
    </RadixTooltip.Provider>
  );
};

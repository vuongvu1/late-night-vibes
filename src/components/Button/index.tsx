import React from "react";
import styles from "./style.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  onClick: () => void;
  /** Optional subtle badge rendered in the top-right corner (e.g. an active count). */
  badge?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ icon, onClick, badge, ...restProps }, ref) => {
  return (
    <button
      ref={ref}
      className={styles.button}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === " ") {
          event.stopPropagation();
        }
      }}
      {...restProps}
    >
      {icon}
      {badge != null && <span className={styles.badge}>{badge}</span>}
    </button>
  );
});

export default Button;

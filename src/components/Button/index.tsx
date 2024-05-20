import React from "react";
import styles from "./style.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ icon, onClick, ...restProps }, ref) => {
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
    </button>
  );
});

export default Button;

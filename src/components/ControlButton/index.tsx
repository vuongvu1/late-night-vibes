import React from "react";
import styles from "./style.module.css";

interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  onClick: () => void;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  onClick,
  ...restProps
}) => {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === " ") {
          console.log("Space key pressed");
          event.preventDefault();
        }
      }}
      {...restProps}
    >
      {icon}
    </button>
  );
};

export default ControlButton;

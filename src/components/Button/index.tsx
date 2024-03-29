import React from "react";
import styles from "./style.module.css";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
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

export default Button;

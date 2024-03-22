import React from "react";
import styles from "./style.module.css";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  onClick: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  ...restProps
}) => {
  return (
    <button className={styles.button} onClick={onClick} {...restProps}>
      {icon}
    </button>
  );
};

export default IconButton;

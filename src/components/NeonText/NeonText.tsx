import styles from "./styles.module.css";
import { NeonTextProps } from "./types";

export const NeonText = ({
  as: Tag,
  children,
  isActive,
  ...restProps
}: NeonTextProps) => {
  return (
    <div className={`${styles.container} ${isActive ? styles.active : ""}`}>
      <Tag
        className={`${styles.text} ${isActive ? styles.active : ""}`}
        data-active={isActive}
        {...restProps}
      >
        {children}
      </Tag>
    </div>
  );
};

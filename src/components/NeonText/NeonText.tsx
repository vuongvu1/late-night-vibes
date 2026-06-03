import styles from "./styles.module.css";
import { NeonTextProps } from "./types";

export const NeonText = ({
  as: Tag,
  children,
  isActive,
  ...restProps
}: NeonTextProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.track} data-active={isActive}>
        <Tag className={styles.content} data-active={isActive} {...restProps}>
          {children}
        </Tag>
        <Tag className={styles.content} aria-hidden="true">
          {children}
        </Tag>
      </div>
    </div>
  );
};

import styles from "./styles.module.css";
import { NeonTextProps } from "./types";

export const NeonText = ({
  as: Tag,
  children,
  ...restProps
}: NeonTextProps) => {
  return (
    <Tag className={styles.neonText} {...restProps}>
      {children}
    </Tag>
  );
};

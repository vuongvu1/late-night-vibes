import styles from "./styles.module.css";
import type { NeonTextProps } from "./types";

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
        {/* Marquee clone: a neutral <span> (not another <Tag>) so a heading
            isn't duplicated in the DOM. aria-hidden keeps it out of the a11y
            tree; .content normalizes the font so it matches the real copy. */}
        <span className={styles.content} aria-hidden="true">
          {children}
        </span>
      </div>
    </div>
  );
};

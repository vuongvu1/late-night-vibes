import React, { CSSProperties } from "react";
import styles from "./style.module.css";

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  wrap?: "wrap" | "nowrap";
  gap?: string;
  children: React.ReactNode;
}

const Flex: React.FC<FlexProps> = ({
  direction = "row",
  justify = "flex-start",
  align = "stretch",
  gap = "0",
  wrap = "nowrap",
  className,
  style,
  children,
  ...restProps
}) => {
  const customStyle = {
    "--flex-direction": direction,
    "--flex-justify": justify,
    "--flex-align": align,
    "--flex-gap": gap,
    "--flex-wrap": wrap,
    ...style,
  } as CSSProperties;

  return (
    <div
      style={customStyle}
      className={`${styles.flex} ${className}`}
      {...restProps}
    >
      {children}
    </div>
  );
};

export default Flex;

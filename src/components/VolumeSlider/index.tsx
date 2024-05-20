import React from "react";
import styles from "./style.module.css";
import { VOLUME_STEP } from "../../constants";

type Props = {
  value: number;
  setValue: (value: number) => void;
};

const VolumeSlider = React.forwardRef<HTMLInputElement, Props>(
  ({ value, setValue, ...restProps }: Props, ref) => {
    return (
      <div className={styles.container}>
        {new Array(VOLUME_STEP).fill("").map((_, index) => (
          <div
            className={styles.block}
            key={index}
            style={
              {
                "--filled-color":
                  value / VOLUME_STEP > index ? "var(--primary-color)" : "",
              } as React.CSSProperties
            }
          />
        ))}
        <input
          type="range"
          min="0"
          max="100"
          step={VOLUME_STEP}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onKeyDown={(e) => e.stopPropagation()}
          className={styles.slider}
          ref={ref}
          {...restProps}
        />
      </div>
    );
  }
);

export default VolumeSlider;

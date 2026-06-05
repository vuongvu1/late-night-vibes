import React from "react";
import { VOLUME_STEP } from "../../constants";
import styles from "./style.module.css";

type Props = {
  value: number;
  setValue: (value: number) => void;
};

const VolumeSlider = React.forwardRef<HTMLInputElement, Props>(
  ({ value, setValue, ...restProps }: Props, ref) => {
    return (
      <div className={styles.container}>
        {/* noArrayIndexKey: static fixed-size array; items never reorder, index keys are stable */}
        {new Array(VOLUME_STEP).fill("").map((_, index) => (
          <div
            key={index}
            className={styles.block}
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
          aria-label="Volume"
          ref={ref}
          {...restProps}
        />
      </div>
    );
  },
);

export default VolumeSlider;

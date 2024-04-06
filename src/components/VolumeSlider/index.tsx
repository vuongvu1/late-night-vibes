import { useState } from "react";
import styles from "./style.module.css";

function VolumeSlider() {
  // TODO: get the initial value from local storage
  const [value, setValue] = useState(80);

  console.log(value);

  return (
    <div className={styles.container}>
      {new Array(10).fill("").map((_, index) => (
        <div
          className={styles.block}
          style={
            {
              "--filled-color":
                value / 10 > index ? "var(--primary-color)" : "",
            } as React.CSSProperties
          }
        />
      ))}
      <input
        type="range"
        min="0"
        max="100"
        step="10"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className={styles.slider}
      />
    </div>
  );
}

export default VolumeSlider;

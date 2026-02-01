import React from "react";
import { useStore } from "../../store";
import styles from "./style.module.css";
import { Flex } from "../Flex";
import { CloseIcon } from "../../assets/icons";

interface SoundEffectsPanelProps {
  onClose: () => void;
}

const SoundEffectsPanel: React.FC<SoundEffectsPanelProps> = ({ onClose }) => {
  const { soundEffects, toggleSoundEffect, setSoundEffectVolume } = useStore();

  return (
    <div className={styles.panel}>
      <Flex justify="space-between" align="center" className={styles.header}>
        <span className={styles.title}>Sound Mixer</span>
        <div className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </div>
      </Flex>

      <div className={styles.scrollArea}>
        {soundEffects.map((effect) => (
          <div
            key={effect.id}
            className={`${styles.effectItem} ${
              effect.isPlaying ? styles.active : ""
            }`}
          >
            <div className={styles.effectHeader}>
              <span className={styles.effectName}>{effect.name}</span>
              <div
                className={`${styles.toggle} ${
                  effect.isPlaying ? styles.active : ""
                }`}
                onClick={() => toggleSoundEffect(effect.id)}
              >
                <div className={styles.toggleCircle} />
              </div>
            </div>
            <div className={styles.volumeContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={effect.volume}
                onChange={(e) =>
                  setSoundEffectVolume(effect.id, parseInt(e.target.value))
                }
                className={styles.slider}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.5)",
                  minWidth: "25px",
                }}
              >
                {effect.volume}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoundEffectsPanel;

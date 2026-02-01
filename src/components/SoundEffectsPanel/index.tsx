import React from "react";
import { useStore } from "../../store";
import styles from "./style.module.css";
import { Flex } from "../Flex";
import { CloseIcon, ResetIcon, ShuffleIcon } from "../../assets/icons";
import { Tooltip } from "../Tooltip";

interface SoundEffectsPanelProps {
  onClose: () => void;
}

const SoundEffectsPanel: React.FC<SoundEffectsPanelProps> = ({ onClose }) => {
  const {
    soundEffects,
    toggleSoundEffect,
    setSoundEffectVolume,
    resetSoundEffects,
    randomizeSoundEffects,
  } = useStore();

  const activeCount = soundEffects.filter((e) => e.isPlaying).length;
  const isMaxReached = activeCount >= 5;

  return (
    <div className={styles.panel}>
      <Flex justify="space-between" align="center" className={styles.header}>
        <Flex align="center" gap="var(--spacing-sm)">
          <span className={styles.title}>Sound Mixer</span>
          <span
            className={`${styles.counter} ${
              isMaxReached ? styles.maxReached : ""
            }`}
          >
            {activeCount}/5
          </span>
        </Flex>

        <div className={styles.headerActions}>
          <Tooltip content="Randomize (3-5 sounds)">
            <div className={styles.iconButton} onClick={randomizeSoundEffects}>
              <ShuffleIcon />
            </div>
          </Tooltip>
          <Tooltip content="Reset All">
            <div className={styles.iconButton} onClick={resetSoundEffects}>
              <ResetIcon />
            </div>
          </Tooltip>
        </div>

        <div className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </div>
      </Flex>

      <div className={styles.scrollArea}>
        {soundEffects.map((effect) => {
          const isDisabled = isMaxReached && !effect.isPlaying;

          return (
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
                  } ${isDisabled ? styles.disabled : ""}`}
                  onClick={() => !isDisabled && toggleSoundEffect(effect.id)}
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
          );
        })}
      </div>
    </div>
  );
};

export default SoundEffectsPanel;

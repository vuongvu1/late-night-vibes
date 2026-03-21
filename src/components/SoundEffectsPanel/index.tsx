import React from "react";
import { useStore } from "../../store";
import { useDraggable } from "../../hooks";
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

  const { position, isDragging, dragRef, handleMouseDown } = useDraggable({
    initialX: window.innerWidth - 370, // Near right edge
    initialY: 100,
  });

  const activeCount = soundEffects.filter((e) => e.isPlaying).length;
  const isMaxReached = activeCount >= 5;

  return (
    <div
      ref={dragRef}
      className={`${styles.panel} ${isDragging ? styles.dragging : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Flex
        justify="space-between"
        align="center"
        className={styles.header}
        onMouseDown={handleMouseDown}
      >
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
            <button
              className={styles.iconButton}
              type="button"
              onClick={randomizeSoundEffects}
              aria-label="Randomize sound effects"
            >
              <ShuffleIcon />
            </button>
          </Tooltip>
          <Tooltip content="Reset All">
            <button
              className={styles.iconButton}
              type="button"
              onClick={resetSoundEffects}
              aria-label="Reset all sound effects"
            >
              <ResetIcon />
            </button>
          </Tooltip>
        </div>

        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close sound mixer"
        >
          <CloseIcon />
        </button>
      </Flex>

      <div className={styles.scrollArea}>
        {soundEffects.map((effect) => {
          const isDisabled = isMaxReached && !effect.isPlaying;
          const sliderId = `sound-effect-volume-${effect.id}`;

          return (
            <div
              key={effect.id}
              className={`${styles.effectItem} ${
                effect.isPlaying ? styles.active : ""
              }`}
            >
              <div className={styles.effectHeader}>
                <label className={styles.effectName} htmlFor={sliderId}>
                  {effect.name}
                </label>
                <button
                  className={`${styles.toggle} ${
                    effect.isPlaying ? styles.active : ""
                  } ${isDisabled ? styles.disabled : ""}`}
                  type="button"
                  onClick={() => !isDisabled && toggleSoundEffect(effect.id)}
                  disabled={isDisabled}
                  role="switch"
                  aria-checked={effect.isPlaying}
                  aria-label={`${effect.isPlaying ? "Disable" : "Enable"} ${effect.name}`}
                >
                  <div className={styles.toggleCircle} />
                </button>
              </div>
              <div className={styles.volumeContainer}>
                <input
                  id={sliderId}
                  type="range"
                  min="0"
                  max="100"
                  value={effect.volume}
                  onChange={(e) =>
                    setSoundEffectVolume(effect.id, parseInt(e.target.value))
                  }
                  className={styles.slider}
                  aria-label={`${effect.name} volume`}
                  disabled={!effect.isPlaying}
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

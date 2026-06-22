import type React from "react";
import { CloseIcon, ResetIcon, ShuffleIcon } from "../../assets/icons";
import { useStore } from "../../store";
import DraggablePanel from "../DraggablePanel";
import { Flex } from "../Flex";
import { Tooltip } from "../Tooltip";
import styles from "./style.module.css";

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
    <DraggablePanel
      storageKey="mixer-panel-position"
      sizeStorageKey="mixer-panel-size"
      initialX={window.innerWidth - 370} // Near right edge
      initialY={170} // Below the fixed top-right info/counter buttons
      className={styles.panel}
    >
      {(handleMouseDown) => (
        <>
          <Flex
            justify="space-between"
            align="center"
            className={styles.header}
            onMouseDown={handleMouseDown}
          >
            <Flex align="center" gap="var(--spacing-sm)">
              <h2 className={styles.title}>Sound Mixer</h2>
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
                      onClick={() =>
                        !isDisabled && toggleSoundEffect(effect.id)
                      }
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
                        setSoundEffectVolume(
                          effect.id,
                          parseInt(e.target.value, 10),
                        )
                      }
                      className={styles.slider}
                      aria-label={`${effect.name} volume`}
                      disabled={!effect.isPlaying}
                    />
                    <span className={styles.percent}>{effect.volume}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DraggablePanel>
  );
};

export default SoundEffectsPanel;

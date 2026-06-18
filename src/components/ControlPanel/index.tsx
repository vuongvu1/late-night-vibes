import {
  ChatIcon,
  FullscreenIcon,
  MixerIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../assets/icons";
import { Button, Flex, Tooltip, VolumeSlider } from "../../components";
import { useStore } from "../../store";
import styles from "./style.module.css";

interface ControlPanelProps {
  isPlaying: boolean;
  isLoading?: boolean;
  volume: number;
  setVolume: (value: number) => void;
  togglePlaying: () => void;
  selectRandomChannel: () => void;
  selectNextChannel: () => void;
  selectPreviousChannel: () => void;
  toggleSoundMixer: () => void;
  activeSoundCount: number;
}

function ControlPanel({
  isPlaying,
  isLoading,
  volume,
  setVolume,
  togglePlaying,
  selectRandomChannel,
  selectNextChannel,
  selectPreviousChannel,
  toggleSoundMixer,
  activeSoundCount,
}: ControlPanelProps) {
  const { toggleFullscreen, toggleChat } = useStore();

  // Show a quiet count badge on the mixer button only while sounds are mixing —
  // keeps the button clean when nothing is active.
  const soundMixerBadge = activeSoundCount > 0 ? activeSoundCount : undefined;

  return (
    <Flex justify="space-between" className={styles.container}>
      <Flex gap="var(--spacing-sm)" justify="flex-start">
        <Tooltip content={isLoading ? "Loading..." : "Play / Pause"}>
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlaying}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
          />
        </Tooltip>
        <Tooltip content="Random channel">
          <Button
            icon={<ShuffleIcon />}
            onClick={selectRandomChannel}
            aria-label="Play a random channel"
          />
        </Tooltip>
        <Tooltip content="Previous channel">
          <Button
            icon={<PreviousIcon />}
            onClick={selectPreviousChannel}
            aria-label="Previous channel"
          />
        </Tooltip>
        <Tooltip content="Next channel">
          <Button
            icon={<NextIcon />}
            onClick={selectNextChannel}
            aria-label="Next channel"
          />
        </Tooltip>
        <Tooltip content="Toggle fullscreen">
          <Button
            icon={<FullscreenIcon />}
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          />
        </Tooltip>
        <Tooltip content="Toggle chat">
          <Button
            icon={<ChatIcon />}
            onClick={toggleChat}
            aria-label="Toggle chat"
          />
        </Tooltip>
        <Tooltip content="Toggle sound mixer">
          <Button
            icon={<MixerIcon />}
            onClick={toggleSoundMixer}
            badge={soundMixerBadge}
            aria-label="Toggle sound mixer"
          />
        </Tooltip>
      </Flex>
      <Flex
        justify="flex-end"
        gap="var(--spacing-sm)"
        className={styles.volumeWrap}
      >
        <Tooltip content="Volume">
          <VolumeSlider value={volume} setValue={setVolume} />
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export default ControlPanel;

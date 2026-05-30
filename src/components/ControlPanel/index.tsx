import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
  FullscreenIcon,
  ChatIcon,
  MixerIcon,
} from "../../assets/icons";
import { Button, Flex, Tooltip, VolumeSlider } from "../../components";
import styles from "./style.module.css";
import { useStore } from "../../store";

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
}: ControlPanelProps) {
  const { toggleFullscreen, toggleChat } = useStore();

  return (
    <Flex justify="space-between" className={styles.container}>
      <Flex gap="var(--spacing-sm)" justify="flex-start">
        <Tooltip
          content={isLoading ? "Loading..." : "Press [Space] to Play/Pause"}
        >
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlaying}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
          />
        </Tooltip>
        <Tooltip content="Press [R] to play a random channel">
          <Button
            icon={<ShuffleIcon />}
            onClick={selectRandomChannel}
            aria-label="Play a random channel"
          />
        </Tooltip>
        <Tooltip content="Press [ArrowLeft] to play previous channel">
          <Button
            icon={<PreviousIcon />}
            onClick={selectPreviousChannel}
            aria-label="Previous channel"
          />
        </Tooltip>
        <Tooltip content="Press [ArrowRight] to play next channel">
          <Button
            icon={<NextIcon />}
            onClick={selectNextChannel}
            aria-label="Next channel"
          />
        </Tooltip>
        <Tooltip content="Press [F] to toggle Fullscreen">
          <Button
            icon={<FullscreenIcon />}
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          />
        </Tooltip>
        <Tooltip content="Press [C] to toggle Chat/Comments">
          <Button
            icon={<ChatIcon />}
            onClick={toggleChat}
            aria-label="Toggle chat"
          />
        </Tooltip>
        <Tooltip content="Press [M] to toggle Sound Mixer">
          <Button
            icon={<MixerIcon />}
            onClick={toggleSoundMixer}
            aria-label="Toggle sound mixer"
          />
        </Tooltip>
      </Flex>
      <Flex
        justify="flex-end"
        gap="var(--spacing-sm)"
        className={styles.volumeWrap}
      >
        <Tooltip content="Press [ArrowUp/Down] to control volume">
          <VolumeSlider value={volume} setValue={setVolume} />
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export default ControlPanel;

import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
  FullscreenIcon,
  ChatIcon,
} from "../../assets/icons";
import { Button, Flex, Tooltip, VolumeSlider } from "../../components";
import styles from "./style.module.css";
import { useStore } from "../../store";

interface ControlPanelProps {
  isPlaying: boolean;
  volume: number;
  setVolume: (value: number) => void;
  togglePlaying: () => void;
  selectRandomChannel: () => void;
  selectNextChannel: () => void;
  selectPreviousChannel: () => void;
  changeBackground: () => void;
}

function ControlPanel({
  isPlaying,
  volume,
  setVolume,
  togglePlaying,
  selectRandomChannel,
  selectNextChannel,
  selectPreviousChannel,
}: // changeBackground,
ControlPanelProps) {
  const { toggleFullscreen, toggleChat } = useStore();
  const togglePlayingWithSound = () => {
    togglePlaying();
  };

  const selectRandomChannelWithSound = () => {
    selectRandomChannel();
  };

  const selectPreviousChannelWithSound = () => {
    selectPreviousChannel();
  };

  const selectNextChannelWithSound = () => {
    selectNextChannel();
  };

  const setVolumeWithSound = (value: number) => {
    setVolume(value);
  };

  return (
    <Flex justify="space-between" className={styles.container}>
      <Flex gap="var(--spacing-sm)" justify="flex-start">
        <Tooltip content="Press [Space] to Play/Pause">
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlayingWithSound}
          />
        </Tooltip>
        <Tooltip content="Press [R] to play a random channel">
          <Button
            icon={<ShuffleIcon />}
            onClick={selectRandomChannelWithSound}
          />
        </Tooltip>
        <Tooltip content="Press [ArrowLeft] to play previous channel">
          <Button
            icon={<PreviousIcon />}
            onClick={selectPreviousChannelWithSound}
          />
        </Tooltip>
        <Tooltip content="Press [ArrowRight] to play next channel">
          <Button icon={<NextIcon />} onClick={selectNextChannelWithSound} />
        </Tooltip>
        <Tooltip content="Press [F] to toggle Fullscreen">
          <Button icon={<FullscreenIcon />} onClick={toggleFullscreen} />
        </Tooltip>
        <Tooltip content="Press [C] to toggle Chat">
          <Button icon={<ChatIcon />} onClick={toggleChat} />
        </Tooltip>
      </Flex>
      <Flex justify="flex-end" gap="var(--spacing-sm)">
        <Tooltip content="Press [ArrowUp/Down] to control volume">
          <VolumeSlider value={volume} setValue={setVolumeWithSound} />
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export default ControlPanel;

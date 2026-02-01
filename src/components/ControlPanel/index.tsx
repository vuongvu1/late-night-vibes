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
  changeBackground: () => void;
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
  const togglePlayingWithSound = () => {
    if (isLoading) return;
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
        <Tooltip
          content={isLoading ? "Loading..." : "Press [Space] to Play/Pause"}
        >
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlayingWithSound}
            disabled={isLoading}
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
        <Tooltip content="Press [C] to toggle Chat/Comments">
          <Button icon={<ChatIcon />} onClick={toggleChat} />
        </Tooltip>
        <Tooltip content="Sound Mixer">
          <Button icon={<MixerIcon />} onClick={toggleSoundMixer} />
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

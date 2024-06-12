import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../assets/icons";
import { Button, Flex, Tooltip, VolumeSlider } from "../../components";
import { playSound } from "../../utils";
import buttonPressSound1Src from "../../assets/sounds/button-press-sound-1.mp3";
import buttonPressSound2Src from "../../assets/sounds/button-press-sound-2.mp3";
import buttonPressSound3Src from "../../assets/sounds/button-press-sound-3.mp3";
import buttonPressSound4Src from "../../assets/sounds/button-press-sound-4.mp3";
import styles from "./style.module.css";

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
  const togglePlayingWithSound = () => {
    playSound(buttonPressSound2Src);
    togglePlaying();
  };

  const selectRandomChannelWithSound = () => {
    playSound(buttonPressSound4Src);
    selectRandomChannel();
  };

  const selectPreviousChannelWithSound = () => {
    playSound(buttonPressSound1Src);
    selectPreviousChannel();
  };

  const selectNextChannelWithSound = () => {
    playSound(buttonPressSound1Src);
    selectNextChannel();
  };

  const setVolumeWithSound = (value: number) => {
    playSound(buttonPressSound3Src);
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
      </Flex>
      <Flex justify="flex-end">
        {/* <Tooltip content="Press [G] to change background">
          <Button icon={"⤾"} onClick={changeBackground} />
        </Tooltip> */}
        <Tooltip content="Press [ArrowUp/Down] to control volume">
          <VolumeSlider value={volume} setValue={setVolumeWithSound} />
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export default ControlPanel;

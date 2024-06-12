import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../assets/icons";
import { Button, Flex, Tooltip, VolumeSlider } from "../../components";
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
  return (
    <Flex justify="space-between" className={styles.container}>
      <Flex gap="var(--spacing-sm)" justify="flex-start">
        <Tooltip content="Press [Space] to Play/Pause">
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlaying}
          />
        </Tooltip>
        <Tooltip content="Press [R] to play a random channel">
          <Button icon={<ShuffleIcon />} onClick={selectRandomChannel} />
        </Tooltip>
        <Tooltip content="Press [ArrowLeft] to play previous channel">
          <Button icon={<PreviousIcon />} onClick={selectPreviousChannel} />
        </Tooltip>
        <Tooltip content="Press [ArrowRight] to play next channel">
          <Button icon={<NextIcon />} onClick={selectNextChannel} />
        </Tooltip>
      </Flex>
      <Flex justify="flex-end">
        {/* <Tooltip content="Press [G] to change background">
          <Button icon={"⤾"} onClick={changeBackground} />
        </Tooltip> */}
        <Tooltip content="Press [ArrowUp/Down] to control volume">
          <VolumeSlider value={volume} setValue={setVolume} />
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export default ControlPanel;

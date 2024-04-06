import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../assets/icons";
import { Button, Flex, VolumeSlider } from "../../components";
import styles from "./style.module.css";

interface ControlPanelProps {
  isPlaying: boolean;
  volume: number;
  setVolume: (value: number) => void;
  togglePlaying: () => void;
  selectRandomChannel: () => void;
  selectNextChannel: () => void;
  selectPreviousChannel: () => void;
}

function ControlPanel({
  isPlaying,
  volume,
  setVolume,
  togglePlaying,
  selectRandomChannel,
  selectNextChannel,
  selectPreviousChannel,
}: ControlPanelProps) {
  return (
    <Flex gap="var(--spacing-sm)" justify="center" className={styles.container}>
      <Button
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        onClick={togglePlaying}
      />
      <Button icon={<ShuffleIcon />} onClick={selectRandomChannel} />
      <Button icon={<PreviousIcon />} onClick={selectPreviousChannel} />
      <Button icon={<NextIcon />} onClick={selectNextChannel} />
      <VolumeSlider value={volume} setValue={setVolume} />
    </Flex>
  );
}

export default ControlPanel;

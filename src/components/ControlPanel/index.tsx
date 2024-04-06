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
  togglePlaying: () => void;

  selectRandomChannel: () => void;
  selectNextChannel: () => void;
  selectPreviousChannel: () => void;
}

function ControlPanel({
  isPlaying,
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
      <VolumeSlider />
    </Flex>
  );
}

export default ControlPanel;

import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../assets/icons";
import { Button, Flex } from "../../components";
import styles from "./style.module.css";

interface ControlPanelProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  selectRandomChannel: () => void;
  selectNextChannel: () => void;
  selectPreviousChannel: () => void;
}

function ControlPanel({
  isPlaying,
  setIsPlaying,
  selectRandomChannel,
  selectNextChannel,
  selectPreviousChannel,
}: ControlPanelProps) {
  return (
    <Flex gap="var(--spacing-sm)" justify="center" className={styles.container}>
      <Button
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        onClick={() => setIsPlaying((prev) => !prev)}
      />
      <Button icon={<ShuffleIcon />} onClick={selectRandomChannel} />
      <Button icon={<PreviousIcon />} onClick={selectNextChannel} />
      <Button icon={<NextIcon />} onClick={selectPreviousChannel} />
    </Flex>
  );
}

export default ControlPanel;

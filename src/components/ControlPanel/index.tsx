import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../assets/icons";
import { ControlButton, Flex } from "../../components";
import styles from "./style.module.css";

interface ControlPanelProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

function ControlPanel({ isPlaying, setIsPlaying }: ControlPanelProps) {
  return (
    <Flex gap="var(--spacing-sm)" className={styles.container}>
      <ControlButton
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        onClick={() => setIsPlaying((prev) => !prev)}
      />
      <ControlButton icon={<ShuffleIcon />} onClick={console.log} />
      <ControlButton icon={<PreviousIcon />} onClick={console.log} />
      <ControlButton icon={<NextIcon />} onClick={console.log} />
    </Flex>
  );
}

export default ControlPanel;

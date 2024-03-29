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
}

function ControlPanel({ isPlaying, setIsPlaying }: ControlPanelProps) {
  return (
    <Flex gap="var(--spacing-sm)" justify="center" className={styles.container}>
      <Button
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        onClick={() => setIsPlaying((prev) => !prev)}
      />
      <Button icon={<ShuffleIcon />} onClick={console.log} />
      <Button icon={<PreviousIcon />} onClick={console.log} />
      <Button icon={<NextIcon />} onClick={console.log} />
    </Flex>
  );
}

export default ControlPanel;

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
    <Flex justify="space-between" className={styles.container}>
      <Flex gap="var(--spacing-sm)" justify="flex-start">
        <Tooltip content={<div>alo</div>}>
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlaying}
          />
        </Tooltip>
        <Tooltip content={<div>alo</div>}>
          <Button icon={<ShuffleIcon />} onClick={selectRandomChannel} />
        </Tooltip>
        <Tooltip content={<div>alo</div>}>
          <Button icon={<PreviousIcon />} onClick={selectPreviousChannel} />
        </Tooltip>
        <Tooltip content={<div>alo</div>}>
          <Button icon={<NextIcon />} onClick={selectNextChannel} />
        </Tooltip>
      </Flex>
      <Tooltip content={<div>alo</div>}>
        <VolumeSlider value={volume} setValue={setVolume} />
      </Tooltip>
    </Flex>
  );
}

export default ControlPanel;

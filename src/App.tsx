import React, { useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
} from "./assets/icons";
import { YouTubePlayer, ControlButton, Flex } from "./components";

import "./App.css";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === " ") {
        setIsPlaying((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <>
      <Flex gap="var(--spacing-sm)">
        <ControlButton
          icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
          onClick={() => setIsPlaying((prev) => !prev)}
        />
        <ControlButton icon={<ShuffleIcon />} onClick={console.log} />
        <ControlButton icon={<PreviousIcon />} onClick={console.log} />
        <ControlButton icon={<NextIcon />} onClick={console.log} />
      </Flex>

      <YouTubePlayer videoId="jfKfPfyJRdk" isPlaying={isPlaying} />

      {/* <Overlay /> */}
    </>
  );
}

export default App;

import React from "react";
import {
  YouTubePlayer,
  ControlPanel,
  Background,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./components";
import { useKeyPress, useChannel } from "./hooks";
import { VOLUME_STEP } from "./constants";
import { removeEmojis } from "./utils";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoTitle, setVideoTitle] = React.useState("");
  const [volume, setVolume] = React.useState(80);

  const {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useChannel();

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useKeyPress({
    Space: togglePlaying,
    KeyR: selectRandomChannel,
    KeyN: selectNextChannel,
    KeyP: selectPreviousChannel,
    ArrowRight: () => setVolume(volume < 100 ? volume + VOLUME_STEP : volume),
    ArrowLeft: () => setVolume(volume > 0 ? volume - VOLUME_STEP : volume),
  });

  return (
    <>
      <YouTubePlayer
        videoId={activeChannel}
        volume={volume}
        isPlaying={isPlaying}
        setVideoTitle={setVideoTitle}
      />
      <Background />
      <Tooltip>
        <TooltipTrigger>
          <h1 style={{ textShadow: "var(--text-highlight-shadow)" }}>
            [LiveRadio {activeChannel}] - {removeEmojis(videoTitle)}
          </h1>
        </TooltipTrigger>
        <TooltipContent>
          <h2>{removeEmojis(videoTitle)}</h2>
        </TooltipContent>
      </Tooltip>
      <ControlPanel
        isPlaying={isPlaying}
        volume={volume}
        setVolume={setVolume}
        togglePlaying={togglePlaying}
        selectRandomChannel={selectRandomChannel}
        selectNextChannel={selectNextChannel}
        selectPreviousChannel={selectPreviousChannel}
      />
    </>
  );
}

export default App;

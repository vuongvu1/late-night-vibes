import React from "react";
import {
  YouTubePlayer,
  ControlPanel,
  Background,
  NeonText,
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
    ArrowRight: selectNextChannel,
    ArrowLeft: selectPreviousChannel,
    ArrowUp: () => setVolume(volume < 100 ? volume + VOLUME_STEP : volume),
    ArrowDown: () => setVolume(volume > 0 ? volume - VOLUME_STEP : volume),
  });

  return (
    <>
      <YouTubePlayer
        videoId={activeChannel}
        volume={volume}
        isPlaying={isPlaying}
        onVideoLoaded={(title) => setVideoTitle(title)}
      />
      <Background />
      <NeonText as="h1">
        [LiveRadio {activeChannel}] - {removeEmojis(videoTitle)}
      </NeonText>

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

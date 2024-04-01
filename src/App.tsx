import React from "react";
import { YouTubePlayer, ControlPanel, Background } from "./components";
import { useSpaceKeyPress, useChannel } from "./hooks";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useChannel();

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useSpaceKeyPress(togglePlaying);

  return (
    <>
      <YouTubePlayer videoId={activeChannel.videoId} isPlaying={isPlaying} />
      <Background />
      <h1>
        [{activeChannel.position}] - {activeChannel.name}
      </h1>
      <ControlPanel
        isPlaying={isPlaying}
        togglePlaying={togglePlaying}
        selectRandomChannel={selectRandomChannel}
        selectNextChannel={selectNextChannel}
        selectPreviousChannel={selectPreviousChannel}
      />
    </>
  );
}

export default App;

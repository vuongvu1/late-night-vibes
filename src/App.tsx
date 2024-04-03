import React from "react";
import { YouTubePlayer, ControlPanel, Background } from "./components";
import { useKeyPress, useChannel } from "./hooks";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoTitle, setVideoTitle] = React.useState("");

  const {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useChannel();

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useKeyPress("Space", togglePlaying);
  useKeyPress("ArrowRight", selectNextChannel);
  useKeyPress("ArrowLeft", selectPreviousChannel);

  return (
    <>
      <YouTubePlayer
        videoId={activeChannel}
        isPlaying={isPlaying}
        setVideoTitle={setVideoTitle}
      />
      <Background />
      <h1>
        [{activeChannel}] - {videoTitle}
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

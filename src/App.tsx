import React from "react";
import { YouTubePlayer, ControlPanel, Background } from "./components";
import { useKeyPress, useChannel } from "./hooks";

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

  console.log(volume);

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useKeyPress({
    Space: togglePlaying,
    KeyN: selectNextChannel,
    KeyP: selectPreviousChannel,
    KeyR: selectRandomChannel,
  });

  return (
    <>
      <YouTubePlayer
        videoId={activeChannel}
        isPlaying={isPlaying}
        setVideoTitle={setVideoTitle}
      />
      <Background />
      <h1>
        [Radio {activeChannel}] - {videoTitle}
      </h1>
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

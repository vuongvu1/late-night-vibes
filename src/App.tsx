import React from "react";
import { YouTubePlayer, ControlPanel, Background } from "./components";
import { useSpaceKeyPress } from "./hooks";
import { selectRandomChannel } from "./utils";
import type { Channel } from "./types";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [activeChannel, setActiveChannel] = React.useState<Channel>(
    selectRandomChannel()
  );

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useSpaceKeyPress(togglePlaying);

  // const randomChannel = selectRandomChannel();
  // console.log(randomChannel);

  return (
    <>
      <YouTubePlayer videoId={activeChannel.videoId} isPlaying={isPlaying} />
      <Background />
      <h1>{activeChannel.name}</h1>
      <ControlPanel isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </>
  );
}

export default App;

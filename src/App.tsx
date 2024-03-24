import React from "react";
import { YouTubePlayer, ControlPanel, Background } from "./components";
import { useSpaceKeyPress } from "./hooks";
import "./App.css";
import data from "../data.json";

const channels = data.channels;

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useSpaceKeyPress(togglePlaying);

  console.log(channels);

  return (
    <>
      <YouTubePlayer videoId="jfKfPfyJRdk" isPlaying={isPlaying} />
      <Background />
      <ControlPanel isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </>
  );
}

export default App;

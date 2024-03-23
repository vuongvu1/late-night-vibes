import React, { useEffect } from "react";
import { YouTubePlayer, ControlPanel, Background } from "./components";
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
      <YouTubePlayer videoId="jfKfPfyJRdk" isPlaying={isPlaying} />
      <Background />
      <ControlPanel isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </>
  );
}

export default App;

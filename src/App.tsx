import React, { useEffect } from "react";
import YouTubePlayer from "./components/YouTubePlayer";
import PlayIcon from "./assets/icons/Play";
import PauseIcon from "./assets/icons/Pause";
// import Overlay from "./components/Overlay/Overlay";
import IconButton from "./components/IconButton";
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
      <IconButton
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        onClick={() => setIsPlaying((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === " ") {
            event.preventDefault();
          }
        }}
      />
      <button>Shuffle</button>
      <button>Previous</button>
      <button>Next</button>

      <YouTubePlayer videoId="jfKfPfyJRdk" isPlaying={isPlaying} />

      {/* <Overlay /> */}
    </>
  );
}

export default App;

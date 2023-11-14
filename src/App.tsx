import YouTubePlayer from "./components/YouTubePlayer";
import Overlay from "./components/Overlay";
import "./App.css";

function App() {
  return (
    <>
      <Overlay />
      <YouTubePlayer videoId="jfKfPfyJRdk" />
    </>
  );
}

export default App;

import { YouTubePlayer, ControlPanel, Background, Flex } from "./components";
import { useChannel, usePlayer } from "./hooks";

function App() {
  const { activeChannel } = useChannel();

  const { isPlaying, togglePlaying, setVideoTitle, volume, bgKey } =
    usePlayer();

  return (
    <Flex direction="column" style={{ height: "90vh" }}>
      <YouTubePlayer
        videoId={activeChannel}
        volume={volume}
        isPlaying={isPlaying}
        onVideoLoaded={setVideoTitle}
      />
      <Background key={bgKey + activeChannel} />

      <ControlPanel
        isPlaying={isPlaying}
        volume={volume}
        setVolume={() => {}}
        togglePlaying={togglePlaying}
        selectRandomChannel={() => {}}
        selectNextChannel={() => {}}
        selectPreviousChannel={() => {}}
        changeBackground={() => {}}
      />
    </Flex>
  );
}

export default App;

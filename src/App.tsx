import {
  YouTubePlayer,
  ControlPanel,
  Background,
  NeonText,
  Flex,
  Spinner,
} from "./components";
import { useChannel, usePlayer } from "./hooks";

function App() {
  const { activeChannel } = useChannel();

  const { isPlaying, togglePlaying, setVideoTitle, volume, bgKey, isLoading } =
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
      <NeonText as="h1" isActive={isPlaying}>
        [Live 24/7]{" "}
        {isLoading ? (
          <Spinner />
        ) : (
          "Chill Radio with Relaxing Beats | Immerse Yourself in an 8-bit Pixel Art Gallery Experience"
        )}
      </NeonText>

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

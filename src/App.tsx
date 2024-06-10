import React from "react";
import {
  YouTubePlayer,
  ControlPanel,
  Background,
  NeonText,
  Flex,
  ChatBlock,
  Spinner,
} from "./components";
import { useKeyPress, useChannel, useAutoSwitchChannelWhenDown } from "./hooks";
import { VOLUME_STEP, VIDEO_DOWN_TITLE } from "./constants";
import { removeEmojis } from "./utils";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoTitle, setVideoTitle] = React.useState("");
  const [volume, setVolume] = React.useState(80);
  // const story = useStory();

  const {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useChannel();

  const togglePlaying = () => setIsPlaying((prev) => !prev);

  useKeyPress({
    Space: togglePlaying,
    KeyR: selectRandomChannel,
    ArrowRight: selectNextChannel,
    ArrowLeft: selectPreviousChannel,
    ArrowUp: () => setVolume(volume < 100 ? volume + VOLUME_STEP : volume),
    ArrowDown: () => setVolume(volume > 0 ? volume - VOLUME_STEP : volume),
  });

  useAutoSwitchChannelWhenDown({
    isChannelDown: videoTitle === VIDEO_DOWN_TITLE,
    callback: selectRandomChannel,
  });

  const shouldShowSpinner = !videoTitle || videoTitle === VIDEO_DOWN_TITLE;

  return (
    <Flex direction="column" style={{ height: "90vh" }}>
      <YouTubePlayer
        videoId={activeChannel}
        volume={volume}
        isPlaying={isPlaying}
        onVideoLoaded={(title) => setVideoTitle(title)}
      />
      <Background key={activeChannel} />
      <NeonText as="h1">
        [Live #{activeChannel.substring(0, 3)}] -{" "}
        {shouldShowSpinner ? <Spinner /> : removeEmojis(videoTitle)}
      </NeonText>

      {/* {story ? (
        <NeonText as="p">{JSON.stringify(story)}</NeonText>
      ) : (
        <Spinner />
      )} */}

      <ChatBlock />

      <ControlPanel
        isPlaying={isPlaying}
        volume={volume}
        setVolume={setVolume}
        togglePlaying={togglePlaying}
        selectRandomChannel={selectRandomChannel}
        selectNextChannel={selectNextChannel}
        selectPreviousChannel={selectPreviousChannel}
      />
    </Flex>
  );
}

export default App;

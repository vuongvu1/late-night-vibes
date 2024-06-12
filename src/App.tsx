import React, { useEffect } from "react";
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
import {
  VOLUME_STEP,
  VIDEO_DOWN_TITLE,
  BACKGROUND_UPDATE_TIMER,
} from "./constants";
import { removeEmojis, playSound } from "./utils";
import pageFlipSoundSrc from "./assets/sounds/page-flip-sound.mp3";

function App() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [videoTitle, setVideoTitle] = React.useState("");
  const [volume, setVolume] = React.useState(80);
  const [bgKey, setBgKey] = React.useState(0);
  // const story = useStory();

  const {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useChannel();

  const togglePlaying = () => setIsPlaying((prev) => !prev);
  const changeBackground = () => {
    playSound(pageFlipSoundSrc);
    setBgKey((prev) => prev + 1);
  };
  const shouldShowSpinner = !videoTitle || videoTitle === VIDEO_DOWN_TITLE;

  useKeyPress({
    Space: togglePlaying,
    KeyR: selectRandomChannel,
    ArrowRight: selectNextChannel,
    ArrowLeft: selectPreviousChannel,
    ArrowUp: () => setVolume(volume < 100 ? volume + VOLUME_STEP : volume),
    ArrowDown: () => setVolume(volume > 0 ? volume - VOLUME_STEP : volume),
    KeyG: changeBackground,
  });

  useAutoSwitchChannelWhenDown({
    isChannelDown: videoTitle === VIDEO_DOWN_TITLE,
    callback: selectRandomChannel,
  });

  useEffect(() => {
    const changeBackgroundTimer = setInterval(
      () => changeBackground(),
      BACKGROUND_UPDATE_TIMER
    );

    return () => clearInterval(changeBackgroundTimer);
  }, []);

  return (
    <Flex direction="column" style={{ height: "90vh" }}>
      <YouTubePlayer
        videoId={activeChannel}
        volume={volume}
        isPlaying={isPlaying}
        onVideoLoaded={(title) => setVideoTitle(title)}
      />
      <Background key={bgKey + activeChannel} />
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
        changeBackground={changeBackground}
      />
    </Flex>
  );
}

export default App;

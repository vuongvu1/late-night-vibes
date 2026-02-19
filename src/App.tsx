import {
  YouTubePlayer,
  ControlPanel,
  Background,
  NeonText,
  Flex,
  ChatPanel,
  Spinner,
  OnlineCounter,
  SoundEffectsPanel,
} from "./components";
import {
  useKeyPress,
  useChannel,
  useAutoSwitchChannelWhenDown,
  usePlayer,
  useSoundEffects,
} from "./hooks";
import { VOLUME_STEP, VIDEO_DOWN_TITLE } from "./constants";
import { cleanText } from "./utils";
import { useStore } from "./store";

function App() {
  const { toggleFullscreen, isChatOpen, toggleChat, isMixerOpen, toggleMixer } =
    useStore();
  const {
    activeRadioNumber,
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useChannel();

  const {
    isPlaying,
    togglePlaying,
    videoTitle,
    setVideoTitle,
    volume,
    setVolume,
    bgKey,
    changeBackground,
    isLoading,
  } = usePlayer();

  useSoundEffects();

  useKeyPress({
    Space: () => !isLoading && togglePlaying(),
    KeyR: selectRandomChannel,
    ArrowRight: selectNextChannel,
    ArrowLeft: selectPreviousChannel,
    ArrowUp: () => setVolume(volume < 100 ? volume + VOLUME_STEP : volume),
    ArrowDown: () => setVolume(volume > 0 ? volume - VOLUME_STEP : volume),
    KeyG: changeBackground,
    KeyF: toggleFullscreen,
    KeyC: toggleChat,
    KeyM: toggleMixer,
  });

  useAutoSwitchChannelWhenDown({
    isChannelDown: videoTitle === VIDEO_DOWN_TITLE,
    callback: selectNextChannel,
  });

  return (
    <Flex direction="column" style={{ height: "90vh" }}>
      <OnlineCounter />
      <YouTubePlayer
        videoId={activeChannel}
        volume={volume}
        isPlaying={isPlaying}
        onVideoLoaded={setVideoTitle}
      />
      <Background key={bgKey + activeChannel} />
      <NeonText as="h1" isActive={isPlaying} key={activeChannel}>
        [Live #{activeRadioNumber}]{" "}
        {isLoading ? <Spinner /> : cleanText(videoTitle)}
      </NeonText>

      {isChatOpen && <ChatPanel />}
      {isMixerOpen && <SoundEffectsPanel onClose={toggleMixer} />}

      <ControlPanel
        isPlaying={isPlaying}
        isLoading={isLoading}
        volume={volume}
        setVolume={setVolume}
        togglePlaying={togglePlaying}
        selectRandomChannel={selectRandomChannel}
        selectNextChannel={selectNextChannel}
        selectPreviousChannel={selectPreviousChannel}
        changeBackground={changeBackground}
        toggleSoundMixer={toggleMixer}
      />
    </Flex>
  );
}

export default App;

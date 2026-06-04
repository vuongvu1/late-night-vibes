import * as RadixTooltip from "@radix-ui/react-tooltip";
import styles from "./App.module.css";
import {
  Background,
  ChatPanel,
  ControlPanel,
  Flex,
  NeonText,
  OnlineCounter,
  SoundEffectsPanel,
  Spinner,
  YouTubePlayer,
} from "./components";
import { VIDEO_DOWN_TITLE, VOLUME_STEP } from "./constants";
import {
  useAutoSwitchChannelWhenDown,
  useChannel,
  useKeyPress,
  usePlayer,
  useSoundEffects,
} from "./hooks";
import { useStore } from "./store";
import { cleanText } from "./utils";

function App() {
  const {
    toggleFullscreen,
    isChatOpen,
    toggleChat,
    isMixerOpen,
    toggleMixer,
    soundEffects,
  } = useStore();
  const activeSoundCount = soundEffects.filter((e) => e.isPlaying).length;
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
    KeyF: toggleFullscreen,
    KeyC: toggleChat,
    KeyM: toggleMixer,
  });

  useAutoSwitchChannelWhenDown({
    isChannelDown: videoTitle === VIDEO_DOWN_TITLE,
    callback: selectNextChannel,
  });

  return (
    <RadixTooltip.Provider delayDuration={200}>
      <Flex direction="column" className={styles.app}>
        <OnlineCounter />
        <YouTubePlayer
          videoId={activeChannel}
          volume={volume}
          isPlaying={isPlaying}
          onVideoLoaded={setVideoTitle}
        />
        <Background />
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
          toggleSoundMixer={toggleMixer}
          activeSoundCount={activeSoundCount}
        />
      </Flex>
    </RadixTooltip.Provider>
  );
}

export default App;

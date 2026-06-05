import * as RadixTooltip from "@radix-ui/react-tooltip";
import { lazy, Suspense } from "react";
import styles from "./App.module.css";
import {
  Background,
  ControlPanel,
  Flex,
  NeonText,
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

// Lazy-loaded so @supabase/supabase-js (their only heavy dependency) is split
// into an on-demand chunk instead of the initial bundle.
const OnlineCounter = lazy(
  () => import("./components/OnlineCounter/OnlineCounter"),
);
const ChatPanel = lazy(() => import("./components/ChatPanel/ChatPanel"));

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
        <Suspense fallback={null}>
          <OnlineCounter />
        </Suspense>
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

        {isChatOpen && (
          <Suspense fallback={null}>
            <ChatPanel />
          </Suspense>
        )}
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

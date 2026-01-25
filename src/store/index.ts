import { create } from "zustand";
import { PlayerStore } from "../types";
import data from "../data.json";
import { playSound } from "../utils";
import buttonPressSound1Src from "../assets/sounds/button-press-sound-1.mp3";
import buttonPressSound2Src from "../assets/sounds/button-press-sound-2.mp3";
import buttonPressSound3Src from "../assets/sounds/button-press-sound-3.mp3";
import buttonPressSound4Src from "../assets/sounds/button-press-sound-4.mp3";
import { VIDEO_DOWN_TITLE } from "../constants";

const channels = data.channels;

const getRandomIndex = (exceptionIndex?: number): number => {
  if (exceptionIndex === undefined) {
    return Math.floor(Math.random() * channels.length);
  }
  const randomIndex = Math.floor(Math.random() * (channels.length - 1));
  return randomIndex >= exceptionIndex ? randomIndex + 1 : randomIndex;
};

const getIndexFromUrl = (): number => {
  const hash = window.location.hash;
  if (hash && hash.startsWith("#")) {
    const index = parseInt(hash.slice(1), 10) - 1;
    if (index >= 0 && index < channels.length) {
      return index;
    }
  }
  return -1;
};

export const useStore = create<PlayerStore>((set, get) => ({
  // State
  isPlaying: false,
  volume: 80,
  videoTitle: "",
  bgKey: 0,
  activeIndex: (() => {
    const indexFromUrl = getIndexFromUrl();
    return indexFromUrl !== -1 ? indexFromUrl : getRandomIndex();
  })(),
  isLoading: true,
  isFullscreen: false,

  // Actions
  togglePlaying: () => {
    playSound(buttonPressSound2Src);
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (volume) => {
    playSound(buttonPressSound3Src);
    set({ volume });
  },

  setVideoTitle: (videoTitle) => {
    set({
      videoTitle,
      isLoading: !videoTitle || videoTitle === VIDEO_DOWN_TITLE,
    });
  },

  changeBackground: () => {
    set((state) => ({ bgKey: state.bgKey + 1 }));
  },

  selectRandomChannel: () => {
    const { activeIndex } = get();
    const randomIndex = getRandomIndex(activeIndex);
    playSound(buttonPressSound4Src);
    set({ activeIndex: randomIndex });
  },

  selectNextChannel: () => {
    const { activeIndex } = get();
    playSound(buttonPressSound1Src);
    set({ activeIndex: (activeIndex + 1) % channels.length });
  },

  selectPreviousChannel: () => {
    const { activeIndex } = get();
    playSound(buttonPressSound1Src);
    set({ activeIndex: (activeIndex - 1 + channels.length) % channels.length });
  },

  setActiveIndex: (activeIndex) => {
    set({ activeIndex });
  },

  toggleFullscreen: () => {
    playSound(buttonPressSound4Src);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  },

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
}));

// Sync fullscreen state with document events
document.addEventListener("fullscreenchange", () => {
  useStore.getState().setIsFullscreen(!!document.fullscreenElement);
});

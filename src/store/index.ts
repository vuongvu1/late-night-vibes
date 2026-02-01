import { create } from "zustand";
import { PlayerStore } from "@/types";
import data from "@/data.json";
import { playSound } from "@/utils";
import buttonPressSound1Src from "@/assets/sounds/control/button-press-sound-1.mp3";
import buttonPressSound2Src from "@/assets/sounds/control/button-press-sound-2.mp3";
import buttonPressSound3Src from "@/assets/sounds/control/button-press-sound-3.mp3";
import buttonPressSound4Src from "@/assets/sounds/control/button-press-sound-4.mp3";
import { SOUND_EFFECTS } from "@/assets/sounds/effect/effects";
import { VIDEO_DOWN_TITLE } from "@/constants";

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
  soundEffects: SOUND_EFFECTS.map((effect) => ({
    ...effect,
    volume: 50,
    isPlaying: false,
  })),

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

  isChatOpen: true,
  toggleChat: () => {
    playSound(buttonPressSound4Src);
    set((state) => ({ isChatOpen: !state.isChatOpen }));
  },

  toggleSoundEffect: (id: string) => {
    const { soundEffects } = get();
    const activeCount = soundEffects.filter((e) => e.isPlaying).length;
    const effect = soundEffects.find((e) => e.id === id);

    // If we're trying to turn it ON but already have 5 active, don't do it
    if (effect && !effect.isPlaying && activeCount >= 5) {
      return;
    }

    set((state) => ({
      soundEffects: state.soundEffects.map((effect) =>
        effect.id === id ? { ...effect, isPlaying: !effect.isPlaying } : effect,
      ),
    }));
  },

  setSoundEffectVolume: (id: string, volume: number) => {
    set((state) => ({
      soundEffects: state.soundEffects.map((effect) =>
        effect.id === id ? { ...effect, volume } : effect,
      ),
    }));
  },

  resetSoundEffects: () => {
    playSound(buttonPressSound1Src);
    set((state) => ({
      soundEffects: state.soundEffects.map((effect) => ({
        ...effect,
        isPlaying: false,
      })),
    }));
  },

  randomizeSoundEffects: () => {
    playSound(buttonPressSound4Src);
    const { soundEffects } = get();
    // Turn everything off first
    const cleanEffects = soundEffects.map((e) => ({ ...e, isPlaying: false }));

    // Pick 3 to 5 random effects
    const count = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
    const shuffled = [...cleanEffects].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      shuffled[i].isPlaying = true;
    }

    set({ soundEffects: shuffled });
  },
}));

// Sync fullscreen state with document events
document.addEventListener("fullscreenchange", () => {
  useStore.getState().setIsFullscreen(!!document.fullscreenElement);
});

import { create } from "zustand";
import buttonPressSound1Src from "@/assets/sounds/control/button-press-sound-1.mp3";
import buttonPressSound2Src from "@/assets/sounds/control/button-press-sound-2.mp3";
import buttonPressSound3Src from "@/assets/sounds/control/button-press-sound-3.mp3";
import buttonPressSound4Src from "@/assets/sounds/control/button-press-sound-4.mp3";
import { SOUND_EFFECTS } from "@/assets/sounds/effect/effects";
import { VIDEO_DOWN_TITLE } from "@/constants";
import data from "@/data.json";
import type { PlayerStore } from "@/types";
import { playSound } from "@/utils";

const channels = data.channels;

// Distinct UI click sounds, named by the actions they accompany.
// Kept 1:1 with the previous per-action assignments.
const SOUNDS = {
  channel: buttonPressSound1Src, // next / previous / reset
  play: buttonPressSound2Src, // play / pause toggle
  volume: buttonPressSound3Src, // volume change
  action: buttonPressSound4Src, // shuffle / fullscreen / chat / mixer / randomize
} as const;

// Mobile (≤600px) starts with chat collapsed so it doesn't cover the player;
// guarded for non-browser (test) environments where it stays open.
const getInitialChatOpen = () =>
  typeof window !== "undefined" ? window.innerWidth > 600 : true;

const VOLUME_KEY = "volume";
// Restore the last volume from storage, falling back to 80. Guarded so a
// corrupt/out-of-range value can't break startup.
const getInitialVolume = (): number => {
  const stored = Number(localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) && stored >= 0 && stored <= 100 ? stored : 80;
};

const getRandomIndex = (exceptionIndex?: number): number => {
  if (exceptionIndex === undefined) {
    return Math.floor(Math.random() * channels.length);
  }
  const randomIndex = Math.floor(Math.random() * (channels.length - 1));
  return randomIndex >= exceptionIndex ? randomIndex + 1 : randomIndex;
};

const getIndexFromUrl = (): number => {
  const hash = window.location.hash;
  // biome-ignore lint/complexity/useOptionalChain: unsafe auto-fix would change truthiness semantics for empty string; explicit guard is clearer
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
  volume: getInitialVolume(),
  videoTitle: "",
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
    playSound(SOUNDS.play);
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (volume) => {
    playSound(SOUNDS.volume);
    localStorage.setItem(VOLUME_KEY, String(volume));
    set({ volume });
  },

  setVideoTitle: (videoTitle) => {
    set({
      videoTitle,
      isLoading: !videoTitle || videoTitle === VIDEO_DOWN_TITLE,
    });
  },

  selectRandomChannel: () => {
    const { activeIndex } = get();
    const randomIndex = getRandomIndex(activeIndex);
    playSound(SOUNDS.action);
    set({ activeIndex: randomIndex });
  },

  selectNextChannel: () => {
    const { activeIndex } = get();
    playSound(SOUNDS.channel);
    set({ activeIndex: (activeIndex + 1) % channels.length });
  },

  selectPreviousChannel: () => {
    const { activeIndex } = get();
    playSound(SOUNDS.channel);
    set({ activeIndex: (activeIndex - 1 + channels.length) % channels.length });
  },

  setActiveIndex: (activeIndex) => {
    set({ activeIndex });
  },

  toggleFullscreen: () => {
    playSound(SOUNDS.action);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  },

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

  isChatOpen: getInitialChatOpen(),
  toggleChat: () => {
    playSound(SOUNDS.action);
    set((state) => ({ isChatOpen: !state.isChatOpen }));
  },

  isMixerOpen: false,
  toggleMixer: () => {
    playSound(SOUNDS.action);
    set((state) => ({ isMixerOpen: !state.isMixerOpen }));
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
    playSound(SOUNDS.channel);
    set((state) => ({
      soundEffects: state.soundEffects.map((effect) => ({
        ...effect,
        isPlaying: false,
      })),
    }));
  },

  randomizeSoundEffects: () => {
    playSound(SOUNDS.action);
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

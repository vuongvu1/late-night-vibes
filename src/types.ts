export type StoryType = {
  personOne: string;
  personTwo: string;
  conversation: {
    person: string;
    content: string;
  }[];
};

export interface SoundEffect {
  id: string;
  name: string;
  file: string;
  volume: number;
  isPlaying: boolean;
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  videoTitle: string;
  bgKey: number;
  activeIndex: number;
  isLoading: boolean;
  isFullscreen: boolean;
  isChatOpen: boolean;
  soundEffects: SoundEffect[];
}

export interface PlayerActions {
  togglePlaying: () => void;
  setVolume: (volume: number) => void;
  setVideoTitle: (title: string) => void;
  changeBackground: () => void;
  selectRandomChannel: () => void;
  selectNextChannel: () => void;
  selectPreviousChannel: () => void;
  setActiveIndex: (index: number) => void;
  toggleFullscreen: () => void;
  setIsFullscreen: (val: boolean) => void;
  toggleChat: () => void;
  toggleSoundEffect: (id: string) => void;
  setSoundEffectVolume: (id: string, volume: number) => void;
  resetSoundEffects: () => void;
  randomizeSoundEffects: () => void;
}

export type PlayerStore = PlayerState & PlayerActions;

export interface Message {
  id: number;
  created_at: string;
  username: string;
  content: string;
}

export type StoryType = {
  personOne: string;
  personTwo: string;
  conversation: {
    person: string;
    content: string;
  }[];
};

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  videoTitle: string;
  bgKey: number;
  activeIndex: number;
  isLoading: boolean;
  isFullscreen: boolean;
  isChatOpen: boolean;
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
}

export type PlayerStore = PlayerState & PlayerActions;

export interface Message {
  id: number;
  created_at: string;
  username: string;
  content: string;
}

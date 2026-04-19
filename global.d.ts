/// <reference types="youtube" />

export {};

declare global {
  interface Window {
    YT: {
      Player: typeof YT.Player;
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

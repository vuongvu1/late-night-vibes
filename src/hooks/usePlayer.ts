import { useStore } from "@/store";

export const usePlayer = () => {
  const {
    isPlaying,
    togglePlaying,
    videoTitle,
    setVideoTitle,
    volume,
    setVolume,
    isLoading,
  } = useStore();

  return {
    isPlaying,
    togglePlaying,
    videoTitle,
    setVideoTitle,
    volume,
    setVolume,
    isLoading,
  };
};

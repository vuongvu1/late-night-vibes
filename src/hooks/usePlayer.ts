import { useEffect } from "react";
import { BACKGROUND_UPDATE_TIMER } from "@/constants";
import { useStore } from "@/store";

export const usePlayer = () => {
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
  } = useStore();

  useEffect(() => {
    const changeBackgroundTimer = setInterval(
      () => changeBackground(),
      BACKGROUND_UPDATE_TIMER,
    );

    return () => clearInterval(changeBackgroundTimer);
  }, [changeBackground]);

  return {
    isPlaying,
    togglePlaying,
    videoTitle,
    setVideoTitle,
    volume,
    setVolume,
    bgKey,
    changeBackground,
    isLoading,
  };
};

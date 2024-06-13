import { useState, useEffect } from "react";
import { playSound } from "../utils";
import { BACKGROUND_UPDATE_TIMER, VIDEO_DOWN_TITLE } from "../constants";
import buttonPressSound2Src from "../assets/sounds/button-press-sound-2.mp3";
import buttonPressSound3Src from "../assets/sounds/button-press-sound-3.mp3";
import pageFlipSoundSrc from "../assets/sounds/page-flip-sound.mp3";

export const usePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [volume, setVolume] = useState(80);
  const [bgKey, setBgKey] = useState(0);

  const togglePlaying = () => {
    playSound(buttonPressSound2Src);
    setIsPlaying((prev) => !prev);
  };

  const changeVolumeWithSound = (value: number) => {
    playSound(buttonPressSound3Src);
    setVolume(value);
  };

  const changeBackground = () => {
    playSound(pageFlipSoundSrc);
    setBgKey((prev) => prev + 1);
  };

  useEffect(() => {
    const changeBackgroundTimer = setInterval(
      () => changeBackground(),
      BACKGROUND_UPDATE_TIMER
    );

    return () => clearInterval(changeBackgroundTimer);
  }, []);

  return {
    isPlaying,
    togglePlaying,
    videoTitle,
    setVideoTitle,
    volume,
    setVolume: changeVolumeWithSound,
    bgKey,
    changeBackground,
    isLoading: !videoTitle || videoTitle === VIDEO_DOWN_TITLE,
  };
};

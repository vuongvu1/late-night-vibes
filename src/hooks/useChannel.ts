import { useState } from "react";
import data from "../data.json";
import { playSound } from "../utils";
import buttonPressSound1Src from "../assets/sounds/button-press-sound-1.mp3";
import buttonPressSound4Src from "../assets/sounds/button-press-sound-4.mp3";

const channels = data.channels;
const getRandomIndex = () => Math.floor(Math.random() * channels.length);

export const useChannel = (initialIndex: number = getRandomIndex()) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeChannel, setActiveChannel] = useState<string>(
    channels[initialIndex]
  );

  const selectRandomChannel = () => {
    const randomIndex = getRandomIndex();
    playSound(buttonPressSound4Src);
    setActiveChannel(channels[randomIndex]);
    setActiveIndex(randomIndex);
  };

  const selectNextChannel = () => {
    const nextPosition = (activeIndex + 1) % channels.length;
    playSound(buttonPressSound1Src);
    setActiveChannel(channels[nextPosition]);
    setActiveIndex(nextPosition);
  };

  const selectPreviousChannel = () => {
    const previousPosition =
      (activeIndex - 1 + channels.length) % channels.length;
    playSound(buttonPressSound1Src);
    setActiveChannel(channels[previousPosition]);
    setActiveIndex(previousPosition);
  };

  return {
    activeRadioNumber: activeIndex + 1,
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  };
};

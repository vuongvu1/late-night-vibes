import { useState } from "react";
import data from "../data.json";

const channels = data.channels;
const getRandomIndex = () => Math.floor(Math.random() * channels.length);

export const useChannel = (initialIndex: number = getRandomIndex()) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeChannel, setActiveChannel] = useState<string>(
    channels[initialIndex]
  );

  const selectRandomChannel = () => {
    const randomIndex = getRandomIndex();
    setActiveChannel(channels[randomIndex]);
    setActiveIndex(randomIndex);
  };

  const selectNextChannel = () => {
    const nextPosition = (activeIndex + 1) % channels.length;
    setActiveChannel(channels[nextPosition]);
    setActiveIndex(nextPosition);
  };

  const selectPreviousChannel = () => {
    const previousPosition =
      (activeIndex - 1 + channels.length) % channels.length;
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

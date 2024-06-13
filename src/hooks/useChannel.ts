import { useState } from "react";
import data from "../data.json";

const channels = data.channels;
const getRandomIndex = () => Math.floor(Math.random() * channels.length);

export const useChannel = (initialRadioNumber?: number = getRandomIndex()) => {
  const [activeRadioNumber, setActiveRadioNumber] = useState(
    initialRadioNumber + 1
  );
  const [activeChannel, setActiveChannel] = useState<string>(
    channels[initialRadioNumber]
  );

  const selectRandomChannel = () => {
    const randomIndex = getRandomIndex();
    setActiveChannel(channels[randomIndex]);
    setActiveRadioNumber(randomIndex + 1);
  };

  const selectNextChannel = () => {
    const currentIndex = activeRadioNumber - 1;
    const nextPosition = (currentIndex + 1) % channels.length;
    setActiveChannel(channels[nextPosition]);
    setActiveRadioNumber(nextPosition + 1);
  };

  const selectPreviousChannel = () => {
    const currentIndex = activeRadioNumber - 1;
    const previousPosition =
      (currentIndex - 1 + channels.length) % channels.length;
    setActiveChannel(channels[previousPosition]);
    setActiveRadioNumber(previousPosition + 1);
  };

  return {
    activeRadioNumber,
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  };
};

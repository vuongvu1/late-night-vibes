import { useState } from "react";
import data from "../data.json";

const channels = data.channels;

export const useChannel = () => {
  const [activeChannel, setActiveChannel] = useState<string>(channels[0]);

  const selectRandomChannel = () => {
    const randomIndex = Math.floor(Math.random() * channels.length);
    setActiveChannel(channels[randomIndex]);
  };

  const selectNextChannel = () => {
    const currentIndex = channels.findIndex(
      (channel) => channel === activeChannel
    );
    const nextPosition = (currentIndex + 1) % channels.length;
    setActiveChannel(channels[nextPosition]);
  };

  const selectPreviousChannel = () => {
    const currentIndex = channels.findIndex(
      (channel) => channel === activeChannel
    );
    const previousPosition =
      (currentIndex - 1 + channels.length) % channels.length;
    setActiveChannel(channels[previousPosition]);
  };

  return {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  };
};

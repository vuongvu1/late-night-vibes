import { useState } from "react";
import type { Channel } from "../types";
import data from "../data.json";

const channels = data.channels;

const useChannel = () => {
  const [activeChannel, setActiveChannel] = useState<Channel>(channels[0]);

  const selectRandomChannel = () => {
    const randomIndex = Math.floor(Math.random() * channels.length);
    setActiveChannel(channels[randomIndex]);
  };

  const selectNextChannel = () => {
    const currentPosition = activeChannel.position;
    const nextPosition = (currentPosition + 1) % channels.length;
    setActiveChannel(channels[nextPosition]);
  };

  const selectPreviousChannel = () => {
    const currentPosition = activeChannel.position;
    const previousPosition =
      (currentPosition - 1 + channels.length) % channels.length;
    setActiveChannel(channels[previousPosition]);
  };

  return {
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  };
};

export default useChannel;

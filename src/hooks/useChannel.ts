import { useState, useEffect, useCallback } from "react";
import data from "../data.json";
import { playSound } from "../utils";
import buttonPressSound1Src from "../assets/sounds/button-press-sound-1.mp3";
import buttonPressSound4Src from "../assets/sounds/button-press-sound-4.mp3";

const channels = data.channels;

const getRandomIndex = (exceptionIndex?: number): number => {
  if (exceptionIndex === undefined) {
    return Math.floor(Math.random() * channels.length);
  }

  const randomIndex = Math.floor(Math.random() * (channels.length - 1));
  // Skip the exceptionIndex to ensure we get a different one
  const normalizedIndex =
    randomIndex >= exceptionIndex ? randomIndex + 1 : randomIndex;
  return normalizedIndex;
};

const getIndexFromUrl = (): number => {
  const hash = window.location.hash; // e.g. "#1"
  if (hash && hash.startsWith("#")) {
    const index = parseInt(hash.slice(1), 10) - 1;
    if (index >= 0 && index < channels.length) {
      return index;
    }
  }
  return -1;
};

export const useChannel = () => {
  const [activeIndex, setActiveIndex] = useState(() => {
    const indexFromUrl = getIndexFromUrl();
    return indexFromUrl !== -1 ? indexFromUrl : getRandomIndex();
  });

  const activeChannel = channels[activeIndex];

  // Sync state to URL Hash
  useEffect(() => {
    const radioValue = `#${activeIndex + 1}`;
    if (window.location.hash !== radioValue) {
      window.history.pushState({ index: activeIndex }, "", radioValue);
    }
  }, [activeIndex]);

  // Sync URL Hash to state
  useEffect(() => {
    const handlePopState = () => {
      const index = getIndexFromUrl();
      if (index !== -1) {
        setActiveIndex(index);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const selectRandomChannel = useCallback(() => {
    const randomIndex = getRandomIndex(activeIndex);
    playSound(buttonPressSound4Src);
    setActiveIndex(randomIndex);
  }, [activeIndex]);

  const selectNextChannel = useCallback(() => {
    const nextPosition = (activeIndex + 1) % channels.length;
    playSound(buttonPressSound1Src);
    setActiveIndex(nextPosition);
  }, [activeIndex]);

  const selectPreviousChannel = useCallback(() => {
    const previousPosition =
      (activeIndex - 1 + channels.length) % channels.length;
    playSound(buttonPressSound1Src);
    setActiveIndex(previousPosition);
  }, [activeIndex]);

  return {
    activeRadioNumber: activeIndex + 1,
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  };
};

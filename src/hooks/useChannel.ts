import { useEffect } from "react";
import data from "@/data.json";
import { useStore } from "@/store";

const channels = data.channels;

export const useChannel = () => {
  const {
    activeIndex,
    setActiveIndex,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  } = useStore();

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
      const hash = window.location.hash;
      if (hash && hash.startsWith("#")) {
        const index = parseInt(hash.slice(1), 10) - 1;
        if (index >= 0 && index < channels.length) {
          setActiveIndex(index);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setActiveIndex]);

  return {
    activeRadioNumber: activeIndex + 1,
    activeChannel,
    selectRandomChannel,
    selectNextChannel,
    selectPreviousChannel,
  };
};

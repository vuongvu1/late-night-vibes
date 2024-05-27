import { useState, useEffect } from "react";
import { getStory } from "../services";

export function useStory(): [boolean, string] {
  const [story, setStory] = useState("");

  useEffect(() => {
    (async () => {
      const storyOfTheDay = await getStory();
      setStory(storyOfTheDay);
    })();
  }, []);

  return [Boolean(!story), story];
}

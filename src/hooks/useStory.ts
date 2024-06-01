import { useState, useEffect } from "react";
import { getStory } from "../services";
import { StoryType } from "../types";

export function useStory(): StoryType | undefined {
  const [story, setStory] = useState<StoryType>();

  useEffect(() => {
    (async () => {
      const storyOfTheDay = await getStory();

      setStory(JSON.parse(storyOfTheDay));
    })();
  }, []);

  return story;
}

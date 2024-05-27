import { useEffect } from "react";

type KeyActionPairs = Record<string, () => void>;

export const useKeyPress = (keyActionPairs: KeyActionPairs) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      Object.entries(keyActionPairs).forEach(([key, action]) => {
        if (event.code === key) {
          action();
        }
      });
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [keyActionPairs]);
};

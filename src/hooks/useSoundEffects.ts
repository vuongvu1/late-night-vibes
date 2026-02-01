import { useEffect, useRef } from "react";
import { useStore } from "@/store";

export const useSoundEffects = () => {
  const { soundEffects, isPlaying: isGlobalPlaying } = useStore();
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    soundEffects.forEach((effect) => {
      if (!audioRefs.current[effect.id]) {
        const audio = new Audio(effect.file);
        audio.loop = true;
        audioRefs.current[effect.id] = audio;
      }

      const audio = audioRefs.current[effect.id];

      // Update volume
      audio.volume = effect.volume / 100;

      // Update play state
      // We only play if both the effect is active AND the global player is playing
      // Or maybe just the effect is active? The user said "on top of the main player".
      // Usually, ambient sounds can be independent or synced. Let's make them independent for now but maybe pause when everything is paused?
      // Actually, if the main player is paused, it's usually better to pause everything.

      const shouldPlay = effect.isPlaying && isGlobalPlaying;

      if (shouldPlay) {
        if (audio.paused) {
          audio
            .play()
            .catch((err) => console.error("Error playing sound effect:", err));
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    });

    // Cleanup: we don't necessarily want to remove audio objects, but we might want to stop them on unmount
    return () => {
      // Logic for cleanup if needed
    };
  }, [soundEffects, isGlobalPlaying]);
};

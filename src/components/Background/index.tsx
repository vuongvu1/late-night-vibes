import { useEffect, useRef, useState } from "react";
import { FADE_MS } from "@/constants";
import { useStore } from "@/store";
import { getBackgroundAt, loadBackground } from "./schedule";
import styles from "./style.module.css";

type Layer = { id: number; gif: string; static: string };

function Background() {
  const { isPlaying } = useStore();
  const [layers, setLayers] = useState<Layer[]>([]);

  // The rotation effect runs once; mirror isPlaying into a ref so it can read the
  // live value when deciding which image to decode ahead of the crossfade.
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    let cancelled = false;
    let nextId: ReturnType<typeof setTimeout>;
    let pruneId: ReturnType<typeof setTimeout>;
    let nextLayerId = 0;

    // Resolve once the browser has actually fetched + decoded the image, so the
    // layer fades in showing the finished frame instead of a blank one that pops
    // in a beat later. A dynamic import only yields the asset URL, not pixels.
    async function preload(src: string) {
      const img = new Image();
      img.src = src;
      try {
        await img.decode();
      } catch {
        // decode() rejects on a broken/interrupted load; fall through and let the
        // <img> tag fetch it the normal way rather than stalling rotation.
      }
    }

    // Resolve the segment's URLs, then decode the one that will actually be shown
    // (only that one, so a paused tab never downloads the multi-MB gif).
    async function loadAndDecode(key: string): Promise<Layer> {
      const { gif, static: staticImg } = await loadBackground(key);
      await preload(isPlayingRef.current ? gif : staticImg);
      return { id: nextLayerId++, gif, static: staticImg };
    }

    function scheduleNext(msUntilNext: number) {
      nextId = setTimeout(transition, msUntilNext);
    }

    async function transition() {
      if (cancelled) return;
      const { key, msUntilNext } = getBackgroundAt(Date.now());
      // Decode the next image while the current one is still on screen…
      const next = await loadAndDecode(key);
      if (cancelled) return;
      // …then stack it on top so it dissolves in over the current layer (no dark
      // dip), and drop the now-hidden layer beneath once the crossfade is done.
      setLayers((prev) => [...prev, next]);
      pruneId = setTimeout(() => {
        if (!cancelled) setLayers((prev) => prev.slice(-1));
      }, FADE_MS);
      scheduleNext(msUntilNext);
    }

    // Initial paint: pick whatever the global clock says is current right now.
    const { key, msUntilNext } = getBackgroundAt(Date.now());
    if (key) {
      loadAndDecode(key).then((first) => {
        if (cancelled) return;
        setLayers([first]);
        scheduleNext(msUntilNext);
      });
    }

    return () => {
      cancelled = true;
      clearTimeout(nextId);
      clearTimeout(pruneId);
    };
  }, []);

  return (
    <div className={styles.container}>
      {layers.map((layer) => {
        const src = isPlaying ? layer.gif : layer.static;
        return (
          <div key={layer.id} className={styles.layer}>
            <img src={src} alt="foreground" className={styles.foreground}></img>
            <img src={src} alt="background" className={styles.background}></img>
          </div>
        );
      })}
    </div>
  );
}

export default Background;

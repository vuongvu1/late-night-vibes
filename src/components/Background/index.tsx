import { useEffect, useRef, useState } from "react";
import { FADE_MS } from "@/constants";
import { useStore } from "@/store";
import { prefersReducedData } from "./prefersReducedData";
import { getBackgroundAt, loadBackground } from "./schedule";
import styles from "./style.module.css";

type Layer = { id: number; gif: string; static: string };

function Background() {
  const { isPlaying } = useStore();
  const [layers, setLayers] = useState<Layer[]>([]);
  // Computed once: data-saver users get the static .jpg even while playing, so
  // we never fetch a multi-MB animated background on a metered connection.
  const [reducedData] = useState(prefersReducedData);
  // Touch devices (iOS especially) choke on blur-over-animation: the full-screen
  // blurred fill below re-runs its blur on every gif frame, doubling the animated
  // surfaces and tanking FPS as decoded frames pile up. Freeze the *fill* to its
  // static frame there — it's blurred + brightened, the freeze is imperceptible.
  // The sharp layer stays animated; desktop GPUs keep the animated fill.
  const [coarsePointer] = useState(
    () => window.matchMedia?.("(pointer: coarse)").matches ?? false,
  );

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
      const showGif = isPlayingRef.current && !reducedData;
      await preload(showGif ? gif : staticImg);
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
  }, [reducedData]);

  return (
    <div className={styles.container}>
      {layers.map((layer) => {
        const animated = isPlaying && !reducedData ? layer.gif : layer.static;
        // On touch devices the blurred fill is frozen to the static frame (see
        // coarsePointer above) — only the sharp layer animates there.
        const fill = coarsePointer ? layer.static : animated;
        return (
          <div key={layer.id} className={styles.layer}>
            <img src={fill} alt="" className={styles.foreground}></img>
            <img src={animated} alt="" className={styles.background}></img>
          </div>
        );
      })}
    </div>
  );
}

export default Background;

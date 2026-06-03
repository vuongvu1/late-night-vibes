import { useEffect, useRef, useState } from "react";
import styles from "./style.module.css";
import { useStore } from "@/store";
import { FADE_MS } from "@/constants";
import { getBackgroundAt, loadBackground } from "./schedule";

function Background() {
  const { isPlaying } = useStore();
  const [gifSrc, setGifSrc] = useState<string>();
  const [staticSrc, setStaticSrc] = useState<string>();
  const [fade, setFade] = useState(false);

  // The rotation effect runs once; mirror isPlaying into a ref so it can read the
  // live value when deciding which image to decode ahead of the fade.
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Resolve once the browser has actually fetched + decoded the image, so
    // fading it in reveals the finished frame instead of a blank one that pops
    // in a beat later. A dynamic import only yields the asset URL, not pixels.
    async function preload(src: string) {
      const img = new Image();
      img.src = src;
      try {
        await img.decode();
      } catch {
        // decode() rejects on a broken/interrupted load; fall through and let
        // the <img> tag fetch it the normal way rather than stalling rotation.
      }
    }

    // Resolve the segment's URLs, then decode the one that will actually be
    // shown (only that one, so a paused tab never downloads the multi-MB gif).
    async function loadAndDecode(key: string) {
      const { gif, static: staticImg } = await loadBackground(key);
      await preload(isPlayingRef.current ? gif : staticImg);
      return { gif, static: staticImg };
    }

    function show(next: { gif: string; static: string }) {
      setGifSrc(next.gif);
      setStaticSrc(next.static);
      setFade(true);
    }

    function scheduleNext(msUntilNext: number) {
      timeoutId = setTimeout(transition, msUntilNext);
    }

    async function transition() {
      if (cancelled) return;
      const { key, msUntilNext } = getBackgroundAt(Date.now());
      // Decode the next image while the current one is still fully visible, so
      // the swap is ready the instant the fade-out completes.
      const next = await loadAndDecode(key);
      if (cancelled) return;
      // Fade out, then swap the ready image in once it's hidden and fade back in.
      setFade(false);
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        show(next);
        scheduleNext(msUntilNext);
      }, FADE_MS);
    }

    // Initial paint: pick whatever the global clock says is current right now.
    const { key, msUntilNext } = getBackgroundAt(Date.now());
    if (key) {
      loadAndDecode(key).then((next) => {
        if (cancelled) return;
        show(next);
        scheduleNext(msUntilNext);
      });
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const currentSrc = isPlaying ? gifSrc : staticSrc;

  return (
    <div
      className={`${styles.container} ${fade ? styles.fadeIn : styles.fadeOut}`}
    >
      <img
        src={currentSrc}
        alt="foreground"
        className={styles.foreground}
      ></img>
      <img
        src={currentSrc}
        alt="background"
        className={styles.background}
      ></img>
    </div>
  );
}

export default Background;

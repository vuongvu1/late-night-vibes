import { useEffect, useState } from "react";
import styles from "./style.module.css";
import { useStore } from "@/store";
import { FADE_MS } from "@/constants";
import { getBackgroundAt, loadBackground } from "./schedule";

function Background() {
  const { isPlaying } = useStore();
  const [gifSrc, setGifSrc] = useState<string>();
  const [staticSrc, setStaticSrc] = useState<string>();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function show(key: string) {
      const { gif, static: staticImg } = await loadBackground(key);
      if (cancelled) return;
      setGifSrc(gif);
      setStaticSrc(staticImg);
      setFade(true);
    }

    function scheduleNext(msUntilNext: number) {
      timeoutId = setTimeout(transition, msUntilNext);
    }

    function transition() {
      // Fade out, then swap to the new segment's image once it's hidden.
      setFade(false);
      timeoutId = setTimeout(async () => {
        if (cancelled) return;
        const { key, msUntilNext } = getBackgroundAt(Date.now());
        await show(key);
        if (cancelled) return;
        scheduleNext(msUntilNext);
      }, FADE_MS);
    }

    // Initial paint: pick whatever the global clock says is current right now.
    const { key, msUntilNext } = getBackgroundAt(Date.now());
    show(key).then(() => {
      if (!cancelled) scheduleNext(msUntilNext);
    });

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

import { useEffect, useState } from "react";
import styles from "./style.module.css";
import { useStore } from "@/store";

const gifModules = import.meta.glob(
  ["../../assets/gifs/*.gif", "../../assets/gifs/*.webp"],
  { import: "default" },
);

const staticModules = import.meta.glob(["../../assets/static/*.jpg"], {
  import: "default",
});

const gifPaths = Object.keys(gifModules);
const gifDict = gifPaths.reduce(
  (acc, path) => {
    const filename = path.split("/").pop()?.split(".")[0];
    if (filename) acc[filename] = path;
    return acc;
  },
  {} as Record<string, string>,
);

const staticDict = Object.keys(staticModules).reduce(
  (acc, path) => {
    const filename = path.split("/").pop()?.split(".")[0];
    if (filename) acc[filename] = path;
    return acc;
  },
  {} as Record<string, string>,
);

const commonKeys = Object.keys(gifDict).filter((k) => staticDict[k]);

function Background() {
  const { isPlaying } = useStore();
  const [gifSrc, setGifSrc] = useState<string>();
  const [staticSrc, setStaticSrc] = useState<string>();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => {
      const randomKey =
        commonKeys[Math.floor(Math.random() * commonKeys.length)];

      const gifImport = gifModules[
        gifDict[randomKey]
      ] as () => Promise<unknown>;
      const staticImport = staticModules[
        staticDict[randomKey]
      ] as () => Promise<unknown>;

      Promise.all([gifImport(), staticImport()]).then(([gif, staticImg]) => {
        setGifSrc(gif as string);
        setStaticSrc(staticImg as string);
        setFade(true);
      });
    }, 500);

    return () => clearTimeout(timeout);
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

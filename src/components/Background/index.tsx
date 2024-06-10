import { useEffect, useState } from "react";
import styles from "./style.module.css";

// @see https://vitejs.dev/guide/features#glob-import
const modules = import.meta.glob(
  ["../../assets/gifs/*.gif", "../../assets/gifs/*.webp"],
  { import: "default" }
);
const GIFS = Object.keys(modules).map((path) => modules[path]);

function Background() {
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    GIFS[Math.floor(Math.random() * GIFS.length)]().then((image) => {
      setImageSrc(image as string);
    });
  }, []);

  return (
    <div className={styles.container}>
      <img src={imageSrc} alt="foreground" className={styles.foreground}></img>
      <img src={imageSrc} alt="background" className={styles.background}></img>
    </div>
  );
}

export default Background;

import styles from "./style.module.css";
import night1Gif from "../../assets/gifs/night-1.gif";
import night2Gif from "../../assets/gifs/night-2.gif";
import night3Gif from "../../assets/gifs/night-3.gif";

const getRandomGif = () => {
  const randomGif = Math.floor(Math.random() * 3) + 1;

  if (randomGif === 1) {
    return night1Gif;
  } else if (randomGif === 2) {
    return night2Gif;
  } else {
    return night3Gif;
  }
};

function Background() {
  const gif = getRandomGif();

  return (
    <div className={styles.container}>
      <img src={gif} alt="foreground" className={styles.foreground}></img>
      <img src={gif} alt="background" className={styles.background}></img>
    </div>
  );
}

export default Background;

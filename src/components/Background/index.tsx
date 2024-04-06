import styles from "./style.module.css";
import night2Gif from "../../assets/gifs/night-2.gif";

function Background() {
  return (
    <div className={styles.container}>
      <img src={night2Gif} alt="foreground" className={styles.foreground}></img>
      <img src={night2Gif} alt="background" className={styles.background}></img>
    </div>
  );
}

export default Background;

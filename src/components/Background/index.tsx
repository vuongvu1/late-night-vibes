import styles from "./style.module.css";
import night3Gif from "../../assets/gifs/night-3.gif";

function Background() {
  return (
    <div className={styles.container}>
      <img src={night3Gif} alt="foreground" className={styles.foreground}></img>
      <img src={night3Gif} alt="background" className={styles.background}></img>
    </div>
  );
}

export default Background;

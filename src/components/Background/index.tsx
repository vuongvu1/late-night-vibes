import styles from "./style.module.css";
import night2Gif from "../../assets/gifs/night-2.gif";

function Background() {
  return (
    <div className={styles.background}>
      <img src={night2Gif} alt="Night 2"></img>
    </div>
  );
}

export default Background;

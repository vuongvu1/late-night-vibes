import styles from "./overlay.module.css";
import night1Gif from "../assets/night-1.gif";

function Overlay() {
  return (
    <div className={styles.overlay}>
      <img src={night1Gif} alt="Night 1 GIF" width="100%" height="100%"></img>
    </div>
  );
}

export default Overlay;

import styles from "./style.module.css";
import night1Gif from "../../assets/night-1.gif";

function Overlay() {
  return (
    <div className={styles.overlay}>
      <img src={night1Gif} alt="Night 1 GIF"></img>
    </div>
  );
}

export default Overlay;

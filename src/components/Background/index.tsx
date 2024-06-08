import styles from "./style.module.css";
import src1 from "../../assets/gifs/1.gif";
import src2 from "../../assets/gifs/2.gif";
import src3 from "../../assets/gifs/3.gif";
import src4 from "../../assets/gifs/4.gif";
import src5 from "../../assets/gifs/5.gif";
import src6 from "../../assets/gifs/6.webp";
import src7 from "../../assets/gifs/7.webp";
import src8 from "../../assets/gifs/8.webp";

const GIFS = [src1, src2, src3, src4, src5, src6, src7, src8];

const getRandomGif = () => {
  const randomGif = Math.floor(Math.random() * GIFS.length) + 1;
  return GIFS[randomGif - 1];
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

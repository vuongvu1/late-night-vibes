import * as Popover from "@radix-ui/react-popover";
import { InfoIcon } from "../../assets/icons";
import buttonPressSoundSrc from "../../assets/sounds/control/button-press-sound-4.mp3";
import { SHORTCUTS } from "../../shortcuts";
import { playSound } from "../../utils";
import styles from "./style.module.css";

// A single info surface that gathers "about" copy and the keyboard shortcut
// reference into one popover, anchored to a button. Sections are stacked so new
// ones (credits, links, …) can be appended without restructuring.
function InfoPanel() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          aria-label="Open info"
          onClick={() => playSound(buttonPressSoundSrc)}
        >
          <InfoIcon />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          sideOffset={10}
          collisionPadding={10}
          align="start"
        >
          <section className={styles.section}>
            <h2 className={styles.heading}>About</h2>
            <p className={styles.blurb}>
              Late Night Vibes | where lonely souls tune in together.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Shortcuts</h2>
            <ul className={styles.shortcutList}>
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.code} className={styles.shortcutRow}>
                  <kbd className={styles.key}>{shortcut.keyLabel}</kbd>
                  <span className={styles.description}>
                    {shortcut.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default InfoPanel;

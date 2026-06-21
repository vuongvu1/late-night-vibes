import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { InfoIcon } from "../../assets/icons";
import buttonPressSoundSrc from "../../assets/sounds/control/button-press-sound-4.mp3";
import { supabase } from "../../services/supabase";
import { SHORTCUTS } from "../../shortcuts";
import { playSound } from "../../utils";
import styles from "./style.module.css";

// A single info surface that gathers the feedback form and the keyboard
// shortcut reference into one popover, anchored to a button. Sections are
// stacked so new ones (credits, links, …) can be appended without restructuring.
function InfoPanel() {
  const [feedback, setFeedback] = useState("");
  // idle | sending | sent | error — drives the submit button + status line.
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = feedback.trim();
    if (!content || status === "sending") return;

    setStatus("sending");
    const { error } = await supabase.from("feedback").insert([{ content }]);
    if (error) {
      setStatus("error");
      return;
    }
    setFeedback("");
    setStatus("sent");
  };

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
            <h2 className={styles.heading}>Feedback</h2>
            {/* stopPropagation so typing (e.g. Space) doesn't fire global shortcuts */}
            <form
              className={styles.feedbackForm}
              onSubmit={handleSubmit}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <textarea
                className={styles.feedbackInput}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="Got a suggestion or found a bug? Tell me."
                rows={3}
                maxLength={1000}
                aria-label="Feedback"
              />
              <div className={styles.feedbackFooter}>
                <span className={styles.feedbackStatus} aria-live="polite">
                  {status === "sent" && "Thanks! 💜"}
                  {status === "error" && "Couldn't send — try again."}
                </span>
                <button
                  type="submit"
                  className={styles.feedbackSubmit}
                  disabled={!feedback.trim() || status === "sending"}
                >
                  {status === "sending" ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
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

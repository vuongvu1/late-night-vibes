import type React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { getCountAt } from "./schedule";
import styles from "./styles.module.css";

const OnlineCounter: React.FC = () => {
  // Displayed count = synced fake base (1–5 walk) + real present listeners.
  const [base, setBase] = useState(() => getCountAt(Date.now()).count);
  const [real, setReal] = useState(0);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // Recompute the base on each step boundary and schedule the next tick exactly
    // when it's due to change — no fixed-interval polling.
    const tick = () => {
      const { count, msUntilNext } = getCountAt(Date.now());
      setBase(count);
      timer = setTimeout(tick, msUntilNext);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Unique ID for this session/tab
    const userIdentifier = Math.random().toString(36).substring(7);

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: userIdentifier,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Unique present clients (includes self once tracked). Added on top of the
        // fake base, so a lone visitor shows base + 1.
        setReal(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
          await channel.track({ online_at: new Date().toISOString() });
        } else {
          // CHANNEL_ERROR / TIMED_OUT / CLOSED — reflect the dropped connection.
          setConnected(false);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className={styles.container}>
      <span
        className={styles.dot}
        data-connected={connected}
        title={connected ? undefined : "Reconnecting…"}
      />
      <span className={styles.text}>{base + real} listening</span>
    </div>
  );
};

export default OnlineCounter;

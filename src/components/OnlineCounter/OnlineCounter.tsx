import type React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import styles from "./styles.module.css";

const OnlineCounter: React.FC = () => {
  const [count, setCount] = useState(1);
  const [connected, setConnected] = useState(true);

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
        const state = channel.presenceState();
        // Count unique keys in presence state
        setCount(Object.keys(state).length + 1);
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
      <span className={styles.text}>{count} listening</span>
    </div>
  );
};

export default OnlineCounter;

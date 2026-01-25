import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import styles from "./styles.module.css";

const OnlineCounter: React.FC = () => {
  const [count, setCount] = useState(1);

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
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className={styles.container}>
      <span className={styles.dot} />
      <span className={styles.text}>{count} listening</span>
    </div>
  );
};

export default OnlineCounter;

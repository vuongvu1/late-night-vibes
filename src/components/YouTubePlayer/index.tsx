import React, { useRef, useEffect, useCallback } from "react";
import style from "./style.module.css";

type Props = { videoId: string; isPlaying: boolean };

const initializePlayer = (
  ref: React.MutableRefObject<YT.Player | null>,
  videoId: string,
  cb?: () => void
) => {
  if (ref.current) {
    const currentVideoUrl = ref.current.getVideoUrl?.();
    if (currentVideoUrl?.includes(videoId)) {
      return;
    }

    ref.current.destroy();
  }

  ref.current = new window.YT.Player("player", {
    height: "auto",
    width: "100%",
    videoId,
    playerVars: {
      fs: 0, // hide fullscreen button by default
      playsinline: 1, // make the player not go fullscreen when playing on ios
      modestbranding: 1, // hide youtube logo by default - we say 'powered by youtube'
      controls: 0, // hide controls by default
      showinfo: 0, // hide video title by default
      iv_load_policy: 3, // hide annotations by default
      rel: 0,
    },
    events: {
      onReady: cb,
    },
  });
};

const YouTubePlayer: React.FC<Props> = ({ videoId, isPlaying }) => {
  const playerRef = useRef<YT.Player | null>(null);

  const checkPlayerStatus = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    // @ts-expect-error - property exists
    const playerTitle = player.videoTitle;

    if (player && !playerTitle) {
      console.log("Stream is down!");
      return;
    }

    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlaying]);

  useEffect(() => {
    initializePlayer(playerRef, videoId, checkPlayerStatus);
  }, [videoId, checkPlayerStatus]);

  checkPlayerStatus();

  return <div id="player" className={style.player} />;
};

export default YouTubePlayer;

import React, { useRef, useEffect } from "react";
import style from "./style.module.css";

type Props = { videoId: string; isPlaying: boolean };

const initializePlayer = (
  ref: React.MutableRefObject<YT.Player>,
  videoId: string
) => {
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
  });
};
const YouTubePlayer: React.FC<Props> = ({ videoId, isPlaying }) => {
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-expect-error -- global type doesn't work
    window.onYouTubeIframeAPIReady = () => initializePlayer(playerRef, videoId);

    return () => {
      // @ts-expect-error -- global type doesn't work
      window.onYouTubeIframeAPIReady = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    const player = playerRef.current;
    const playerState = player?.getPlayerState?.();

    if (!player || !playerState) {
      console.log("Player not ready");
      return;
    }

    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlaying]);

  return <div id="player" className={style.player} />;
};

export default YouTubePlayer;

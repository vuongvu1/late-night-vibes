import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { VIDEO_DOWN_TITLE } from "../../constants";
import style from "./style.module.css";

type Props = {
  videoId: string;
  volume: number;
  isPlaying: boolean;
  onVideoLoaded: (title: string) => void;
};

type PlayerWithTitle = YT.Player & {
  videoTitle?: string;
};

const initializePlayer = (
  ref: React.MutableRefObject<PlayerWithTitle | null>,
  videoId: string,
  cb?: () => void,
) => {
  if (ref.current) {
    const currentVideoUrl = ref.current.getVideoUrl?.();
    if (currentVideoUrl?.includes(videoId)) {
      return;
    }

    ref.current.destroy();
  }

  window.YT.ready(() => {
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
  });
};

const YouTubePlayer: React.FC<Props> = ({
  videoId,
  volume,
  isPlaying,
  onVideoLoaded,
}) => {
  const playerRef = useRef<PlayerWithTitle | null>(null);

  const checkPlayerStatus = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const playerTitle = player.videoTitle;

    if (!playerTitle) {
      onVideoLoaded(VIDEO_DOWN_TITLE);
      return;
    }

    onVideoLoaded(playerTitle);

    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlaying, onVideoLoaded]);

  useEffect(() => {
    initializePlayer(playerRef, videoId, checkPlayerStatus);
  }, [videoId, checkPlayerStatus]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume?.(volume);
    }
  }, [volume]);

  useEffect(() => {
    checkPlayerStatus();
  }, [checkPlayerStatus]);

  // Wrap the YT target in a React-owned container the YouTube IFrame API never
  // touches. `new YT.Player("player")` replaces the inner #player div with an
  // <iframe> out-of-band; if React held that node as a host sibling, a later
  // Suspense reveal of a preceding sibling (e.g. the lazy OnlineCounter) would
  // call insertBefore() against a node no longer in the DOM and throw. The
  // wrapper is layout-neutral via `display: contents`, so visuals are unchanged.
  return (
    <div className={style.playerContainer}>
      <div
        id="player"
        className={style.player}
        role="region"
        aria-label="Live radio player"
      />
    </div>
  );
};

export default YouTubePlayer;

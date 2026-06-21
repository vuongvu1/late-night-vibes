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
      // Mobile browsers can leave a programmatically-started player muted.
      // This play is downstream of the user's Play tap, so unmute as part of
      // it to guarantee audio. No-op on desktop where the player isn't muted.
      player.unMute?.();
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlaying, onVideoLoaded]);

  // Read the latest isPlaying / status callback from refs inside the init
  // effect below, so it can depend on videoId ALONE. Play/pause toggles must
  // not re-run init (that was tearing the player down and, before the player
  // finished initialising, calling control methods that don't exist yet).
  const isPlayingRef = useRef(isPlaying);
  const checkStatusRef = useRef(checkPlayerStatus);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    checkStatusRef.current = checkPlayerStatus;
  }, [checkPlayerStatus]);

  // Runs only when the channel (videoId) changes — isPlaying and the status
  // callback are read via the refs above, so play/pause never re-inits.
  useEffect(() => {
    const player = playerRef.current;

    // Player exists AND its control API is wired up. Those methods only appear
    // once the iframe API finishes initialising — a freshly-constructed, not-
    // yet-ready instance doesn't have them, so guard on the function check.
    // Swap the video in place rather than rebuilding: a new <iframe> loses the
    // audio-autoplay permission from the user's first Play tap, so on iOS the
    // new channel stays silent. loadVideoById() plays now; cueVideoById() loads
    // without playing.
    if (player && typeof player.loadVideoById === "function") {
      const currentVideoUrl = player.getVideoUrl?.();
      if (currentVideoUrl?.includes(videoId)) return;

      if (isPlayingRef.current) {
        player.unMute?.();
        player.loadVideoById(videoId);
      } else {
        player.cueVideoById(videoId);
      }
      checkStatusRef.current();
      return;
    }

    // No player yet, or one still initialising → (re)create with this video.
    // The iframe_api script can be blocked/slow; bail rather than throw on
    // window.YT (the effect re-runs when videoId next changes).
    if (typeof window.YT === "undefined" || !window.YT.ready) return;
    player?.destroy?.();
    window.YT.ready(() => {
      playerRef.current = new window.YT.Player("player", {
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
          onReady: () => checkStatusRef.current(),
        },
      });
    });
  }, [videoId]);

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

import React, { useRef, useEffect } from "react";

const YouTubePlayer: React.FC<{ videoId: string }> = ({ videoId }) => {
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-expect-error -- global type doesn't work
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      // @ts-expect-error -- global type doesn't work
      window.onYouTubeIframeAPIReady = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializePlayer = () => {
    playerRef.current = new window.YT.Player("player", {
      height: "auto",
      width: "100%",
      videoId: videoId,
      events: {
        // You can add event listeners here if needed
      },
    });

    document.body.addEventListener("keypress", handleKeyPress);
  };

  const handleKeyPress = () => {
    playerRef.current?.playVideo();
  };

  return <div id="player" />;
};

export default YouTubePlayer;

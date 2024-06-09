import { useEffect } from "react";

type Props = {
  isChannelDown: boolean;
  callback: () => void;
};

export const useAutoSwitchChannelWhenDown = ({
  isChannelDown,
  callback,
}: Props) => {
  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | undefined;

    if (isChannelDown) {
      intervalId = setInterval(callback, 2000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isChannelDown, callback]);
};

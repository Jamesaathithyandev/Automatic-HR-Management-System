"use client";

import * as React from "react";
import { calculateElapsedSeconds } from "@/lib/date/timezone";

export function useAttendanceTimer(checkInAtIso?: string | null) {
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(() => {
    return checkInAtIso ? calculateElapsedSeconds(checkInAtIso) : 0;
  });

  React.useEffect(() => {
    if (!checkInAtIso) {
      setElapsedSeconds(0);
      return;
    }

    // Set initial accurate seconds
    setElapsedSeconds(calculateElapsedSeconds(checkInAtIso));

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsedSeconds(checkInAtIso));
    }, 1000);

    return () => clearInterval(interval);
  }, [checkInAtIso]);

  const formattedTime = React.useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [elapsedSeconds]);

  return {
    elapsedSeconds,
    formattedTime,
    isRunning: Boolean(checkInAtIso),
  };
}


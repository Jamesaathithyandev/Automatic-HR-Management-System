"use client";

import * as React from "react";
import { BentoCard } from "@/components/bento/bento-card";
import { Play, Square, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCheckInCardProps {
  isCheckedIn?: boolean;
  activeTime?: string;
  workDate?: string;
  targetMinutes?: number;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function HeroCheckInCard({
  isCheckedIn = false,
  activeTime = "00:00:00",
  workDate = "Today",
  targetMinutes = 480,
  onCheckIn,
  onCheckOut,
  isLoading = false,
  className,
}: HeroCheckInCardProps) {
  const [internalCheckedIn, setInternalCheckedIn] = React.useState(isCheckedIn);
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    setInternalCheckedIn(isCheckedIn);
  }, [isCheckedIn]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (internalCheckedIn) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [internalCheckedIn]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const displayTime = internalCheckedIn
    ? seconds > 0
      ? formatTimer(seconds)
      : activeTime
    : "00:00:00";

  const handleToggle = () => {
    if (internalCheckedIn) {
      onCheckOut?.();
      setInternalCheckedIn(false);
    } else {
      onCheckIn?.();
      setInternalCheckedIn(true);
    }
  };

  return (
    <BentoCard
      className={cn(
        "p-6 relative overflow-hidden transition-all duration-300",
        internalCheckedIn
          ? "border-brand-purple/40 shadow-float"
          : "border-border-light",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                internalCheckedIn
                  ? "bg-status-success-bg text-status-success-text"
                  : "bg-card-subtle text-text-secondary"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  internalCheckedIn
                    ? "bg-status-success-dot animate-pulse"
                    : "bg-text-tertiary"
                )}
              />
              {internalCheckedIn ? "Active Session" : "Checked Out"}
            </span>
            <span className="text-xs text-text-tertiary font-medium">
              Target: {Math.floor(targetMinutes / 60)}h {targetMinutes % 60}m
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary font-mono">
              {displayTime}
            </div>
            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {internalCheckedIn
                ? `Session running for ${workDate}`
                : "Ready to start your work day?"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            "w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 select-none",
            internalCheckedIn
              ? "bg-status-danger-bg text-status-danger-text hover:bg-status-danger-bg/80 border border-status-danger-dot/20"
              : "bg-brand-navy text-white hover:bg-brand-navy-hover hover:shadow-lg border border-border-light/20"
          )}
        >
          {internalCheckedIn ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Check Out Now</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Check In</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-border-light/60 flex items-center justify-between text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-purple" />
          Server-synced timestamps & timezone-aware
        </span>
        <span className="flex items-center gap-1 font-semibold text-brand-purple">
          <Sparkles className="w-3.5 h-3.5" />
          Auto-regularization supported
        </span>
      </div>
    </BentoCard>
  );
}


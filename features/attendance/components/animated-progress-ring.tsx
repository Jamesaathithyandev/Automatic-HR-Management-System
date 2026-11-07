"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  title?: string;
  caption?: string;
  className?: string;
}

export function AnimatedProgressRing({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = "var(--brand-purple)",
  trackColor = "var(--card-subtle)",
  title,
  caption,
  className,
}: AnimatedProgressRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center"
          aria-hidden="true"
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Animated fill circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: shouldReduceMotion ? strokeDashoffset : strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold tracking-tight text-text-primary">
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      </div>

      {title && (
        <span className="mt-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
          {title}
        </span>
      )}

      {caption && (
        <p className="mt-1 text-xs text-text-tertiary max-w-[140px] leading-tight">
          {caption}
        </p>
      )}
    </div>
  );
}


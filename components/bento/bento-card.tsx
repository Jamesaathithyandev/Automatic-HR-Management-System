"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BentoCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: "default" | "purple" | "dashed" | "subtle";
  onClick?: () => void;
}

export function BentoCard({
  title,
  subtitle,
  action,
  badge,
  children,
  className,
  bodyClassName,
  variant = "default",
  onClick,
}: BentoCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    default:
      "bg-card text-text-primary border border-border-light/70 shadow-card hover:shadow-float",
    purple:
      "bg-brand-purple text-white border-0 shadow-float",
    dashed:
      "bg-card/60 border-2 border-dashed border-card-dashed hover:border-brand-purple hover:bg-brand-purple-light/10 text-text-secondary cursor-pointer",
    subtle:
      "bg-card-subtle text-text-primary border border-border-light shadow-sm",
  };

  const isInteractive = Boolean(onClick);

  return (
    <motion.section
      whileHover={!shouldReduceMotion && (isInteractive || variant === "default") ? { y: -3 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "relative rounded-[26px] p-6 flex flex-col justify-between transition-colors duration-200",
        variantStyles[variant],
        isInteractive && "cursor-pointer",
        className
      )}
    >
      {(title || action || badge) && (
        <header className="flex items-center justify-between gap-3 mb-4 select-none">
          <div className="flex items-center gap-2 min-w-0">
            {typeof title === "string" ? (
              <h3
                className={cn(
                  "text-lg font-bold tracking-tight truncate",
                  variant === "purple" ? "text-white" : "text-text-primary"
                )}
              >
                {title}
              </h3>
            ) : (
              title
            )}
            {badge}
          </div>

          {action && (
            <div className="shrink-0 flex items-center gap-1 text-xs font-semibold">
              {action}
            </div>
          )}
        </header>
      )}

      {subtitle && (
        <p
          className={cn(
            "text-xs mb-3 -mt-2",
            variant === "purple" ? "text-white/80" : "text-text-secondary"
          )}
        >
          {subtitle}
        </p>
      )}

      <div className={cn("w-full flex-1", bodyClassName)}>{children}</div>
    </motion.section>
  );
}


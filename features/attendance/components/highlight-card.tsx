"use client";

import * as React from "react";
import { BentoCard } from "@/components/bento/bento-card";
import { Award, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighlightCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
  className?: string;
}

export function HighlightCard({
  title = "Attendance Policy",
  description = "Remember: Daily check-in grace period is 15 mins. Regularize any missed punches within 3 days.",
  buttonText = "View Full Policy",
  onAction,
  className,
}: HighlightCardProps) {
  return (
    <BentoCard
      variant="purple"
      className={cn("p-6 justify-between relative overflow-hidden", className)}
    >
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white mb-4 shadow-inner">
          <Award className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h3>

        <p className="text-xs text-white/85 leading-relaxed max-w-[260px]">
          {description}
        </p>
      </div>

      <div className="mt-6 relative z-10">
        <button
          type="button"
          onClick={onAction}
          className="w-full py-3 px-4 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-hover transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Decorative background curve */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
    </BentoCard>
  );
}


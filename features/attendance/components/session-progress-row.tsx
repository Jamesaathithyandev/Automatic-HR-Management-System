import * as React from "react";
import { cn } from "@/lib/utils";

interface SessionProgressRowProps {
  title: string;
  timestamp: string;
  duration: string;
  percentage: number;
  tags?: string[];
  meta?: React.ReactNode;
  className?: string;
}

export function SessionProgressRow({
  title,
  timestamp,
  duration,
  percentage,
  tags = [],
  meta,
  className,
}: SessionProgressRowProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 border-b border-border-light/60 last:border-0 hover:bg-card-subtle/50 px-2 rounded-xl transition-colors",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text-primary truncate">{title}</h4>
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-purple-light text-brand-purple"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">{timestamp}</p>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-text-tertiary block font-semibold">
            Duration
          </span>
          <span className="text-xs font-bold text-text-primary">{duration}</span>
        </div>

        <div className="w-28 flex items-center gap-2">
          <div className="w-full bg-card-subtle h-2 rounded-full overflow-hidden border border-border-light/40">
            <div
              className="bg-brand-purple h-full rounded-full transition-all duration-300"
              style={{ width: `${clamped}%` }}
            />
          </div>
          <span className="text-xs font-bold text-text-primary min-w-[32px] text-right">
            {clamped}%
          </span>
        </div>

        {meta && <div className="shrink-0">{meta}</div>}
      </div>
    </div>
  );
}


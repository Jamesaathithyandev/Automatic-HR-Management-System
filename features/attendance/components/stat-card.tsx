"use client";

import * as React from "react";
import { BentoCard } from "@/components/bento/bento-card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  progress?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  className,
}: StatCardProps) {
  return (
    <BentoCard className={cn("p-5 justify-between min-h-[140px]", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-full bg-brand-purple-light flex items-center justify-center text-brand-purple">
            {icon}
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-2xl font-extrabold text-text-primary tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-text-tertiary mt-1 font-medium">{subtitle}</p>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-card-subtle h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-purple h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={cn(
              "inline-flex items-center gap-0.5",
              trend.isPositive ? "text-status-success-text" : "text-status-danger-text"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-text-tertiary font-normal">{trend.label}</span>
          )}
        </div>
      )}
    </BentoCard>
  );
}


"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashedAddCardProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function DashedAddCard({
  label = "Add new request",
  onClick,
  className,
}: DashedAddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full py-4 px-5 rounded-2xl border-2 border-dashed border-card-dashed hover:border-brand-purple hover:bg-brand-purple-light/10 text-text-secondary hover:text-brand-purple transition-all duration-200 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer group active:scale-[0.99]",
        className
      )}
    >
      <div className="w-6 h-6 rounded-lg bg-brand-purple-light group-hover:bg-brand-purple group-hover:text-white flex items-center justify-center text-brand-purple transition-colors">
        <Plus className="w-4 h-4" />
      </div>
      <span>{label}</span>
    </button>
  );
}


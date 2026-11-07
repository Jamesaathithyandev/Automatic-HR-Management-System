"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("inline-flex items-center bg-card-subtle p-1 rounded-full border border-border-light", className)}>
        <div className="w-16 h-7 rounded-full bg-card" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={cn(
        "inline-flex items-center bg-card-subtle p-1 rounded-full border border-border-light text-xs font-semibold select-none",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
          !isDark
            ? "bg-brand-purple text-white shadow-sm font-bold"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
          isDark
            ? "bg-brand-purple text-white shadow-sm font-bold"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
    </div>
  );
}


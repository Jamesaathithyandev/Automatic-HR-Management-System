"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Settings, Download, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CommandPalette } from "@/components/shared/command-palette";
import { NotificationCenter } from "@/components/shared/notification-center";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TopNavBarProps {
  userRole?: "employee" | "manager" | "hr" | "admin";
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  className?: string;
}

export function TopNavBar({
  userRole = "employee",
  onPrimaryAction,
  primaryActionLabel = "Quick Check-in",
  className,
}: TopNavBarProps) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const navTabs = [
    { label: "Dashboard", href: "/" },
    { label: "Attendance", href: "/attendance" },
    { label: "Requests", href: "/requests" },
    { label: "Team", href: "/team", requiresManager: true },
    { label: "Reports", href: "/reports", requiresHR: true },
    { label: "Gallery", href: "/gallery" },
  ].filter((tab) => {
    if (tab.requiresManager && userRole === "employee") return false;
    if (tab.requiresHR && (userRole === "employee" || userRole === "manager"))
      return false;
    return true;
  });

  const handleExport = () => {
    toast.success("Preparing Excel (.xlsx) export...", {
      description: "Generating and downloading your team attendance sheet.",
    });
    window.open("/api/attendance/export?format=xlsx", "_blank");
  };

  return (
    <>
      <header
        className={cn(
          "w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 select-none",
          className
        )}
      >
        {/* Left: Role Navigation Tabs */}
        <nav
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar"
          aria-label="Module tabs"
        >
          {navTabs.map((tab) => {
            const isActive =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-brand-purple bg-brand-purple-light/70"
                    : "text-text-secondary hover:text-text-primary hover:bg-card-subtle"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Center & Right Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Bar / Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card-subtle hover:bg-card border border-border-light text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer shadow-sm group"
          >
            <Search className="w-3.5 h-3.5 text-brand-purple" />
            <span className="hidden sm:inline">Search or type command</span>
            <span className="sm:hidden">Search</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-card border border-border-light text-text-tertiary group-hover:text-text-primary">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Segmented Control) */}
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            type="button"
            title="Notifications"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-full bg-card-subtle hover:bg-card border border-border-light text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-purple ring-2 ring-card" />
          </button>

          {/* Settings Icon */}
          <Link
            href="/settings"
            title="Settings"
            className="p-2 rounded-full bg-card-subtle hover:bg-card border border-border-light text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Export Data Button with .xlsx Badge */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card-subtle hover:bg-card border border-border-light text-xs font-bold text-text-primary transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span className="hidden md:inline">Export data</span>
            <span className="px-1.5 py-0.2 rounded-md bg-brand-purple-light text-brand-purple text-[10px] font-mono font-extrabold uppercase">
              .xlsx
            </span>
          </button>

          {/* Primary Dark Navy Action Button */}
          <button
            type="button"
            onClick={onPrimaryAction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer border border-border-light/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{primaryActionLabel}</span>
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Slide-over Notification Center */}
      <NotificationCenter
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}

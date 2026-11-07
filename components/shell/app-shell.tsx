"use client";

import * as React from "react";
import { CurvedSidebar } from "@/components/shell/curved-sidebar";
import { TopNavBar } from "@/components/shell/top-nav-bar";
import { BottomTabBar } from "@/components/shell/bottom-tab-bar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: "employee" | "manager" | "hr" | "admin";
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  className?: string;
}

export function AppShell({
  children,
  userRole = "employee",
  onPrimaryAction,
  primaryActionLabel = "Quick Check-in",
  className,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-2.5 sm:p-5 md:p-8 transition-colors duration-300">
      {/* Main Rounded Shell Container */}
      <div
        className={cn(
          "w-full max-w-[1560px] bg-shell rounded-[32px] shadow-shell border border-border-light/50 p-4 sm:p-6 md:p-8 flex gap-5 md:gap-7 min-h-[92vh] relative overflow-hidden transition-colors duration-300",
          className
        )}
      >
        {/* Left Curved Inset Sidebar */}
        <CurvedSidebar />

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <TopNavBar
            userRole={userRole}
            onPrimaryAction={onPrimaryAction}
            primaryActionLabel={primaryActionLabel}
          />

          <main className="flex-1 w-full flex flex-col min-w-0">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <BottomTabBar />
      </div>
    </div>
  );
}


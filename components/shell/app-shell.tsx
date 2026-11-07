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
    <div className="min-h-screen w-full bg-shell flex flex-col md:flex-row transition-colors duration-300 relative">
      {/* Left Docked Curved Sidebar */}
      <CurvedSidebar />

      {/* Main Full-Width Application Area */}
      <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 md:px-8 lg:px-10 py-5 pb-20 md:pb-8">
        <TopNavBar
          userRole={userRole}
          onPrimaryAction={onPrimaryAction}
          primaryActionLabel={primaryActionLabel}
        />

        <main className={cn("flex-1 w-full flex flex-col min-w-0", className)}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomTabBar />
    </div>
  );
}


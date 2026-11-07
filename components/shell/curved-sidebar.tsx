"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Clock,
  Users,
  FileCheck2,
  BarChart3,
  CalendarDays,
  Settings,
  ShieldAlert,
  Bell,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: "green" | "purple" | "amber";
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Team", href: "/team", icon: Users, badge: "3", badgeColor: "green" },
  { label: "Requests", href: "/requests", icon: FileCheck2 },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Holidays", href: "/holidays", icon: CalendarDays },
  { label: "Gallery", href: "/gallery", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function CurvedSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 left-0 hidden md:flex flex-col items-center justify-between py-6 px-3 w-[84px] lg:w-[88px] h-screen bg-brand-purple text-white shadow-float select-none shrink-0 z-40 rounded-r-[32px] transition-all",
        className
      )}
      aria-label="Sidebar navigation"
    >
      {/* Top Brand Logo / Icon */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/"
          className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-inner"
          title="RemoteHR Home"
        >
          <div className="grid grid-cols-2 gap-1 p-1">
            <span className="w-2 h-2 rounded-sm bg-white" />
            <span className="w-2 h-2 rounded-sm bg-white/70" />
            <span className="w-2 h-2 rounded-sm bg-white/70" />
            <span className="w-2 h-2 rounded-sm bg-white" />
          </div>
        </Link>

        {/* Navigation Item Stack */}
        <nav className="flex flex-col items-center gap-3.5 mt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-white text-brand-purple shadow-md scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                  )}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border-2 border-brand-purple",
                        item.badgeColor === "green"
                          ? "bg-status-success-dot text-white"
                          : "bg-status-warning-dot text-brand-navy"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Floating Tooltip on Hover */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                  <div className="bg-brand-navy text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap border border-border-light/30">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Quick Action */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/settings"
          className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          title="Account Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}


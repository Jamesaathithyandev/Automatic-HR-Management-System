"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { StatusPill } from "@/components/shared/status-pill";
import { AvatarStack } from "@/components/shared/avatar-stack";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AnimatedProgressRing } from "@/features/attendance/components/animated-progress-ring";
import { HeroCheckInCard } from "@/features/attendance/components/hero-check-in-card";
import { StatCard } from "@/features/attendance/components/stat-card";
import { SessionProgressRow } from "@/features/attendance/components/session-progress-row";
import { HighlightCard } from "@/features/attendance/components/highlight-card";
import { NotificationItem } from "@/features/attendance/components/notification-item";
import { DashedAddCard } from "@/features/attendance/components/dashed-add-card";
import { AttendanceCalendarCard } from "@/features/calendar/components/attendance-calendar-card";
import {
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function GalleryPage() {
  const [demoPercentage, setDemoPercentage] = React.useState(85);

  const mockUsers = [
    { id: "1", name: "James Aathithyan", status: "online" as const },
    { id: "2", name: "Rachel Lee", status: "online" as const },
    { id: "3", name: "Ken Smith", status: "idle" as const },
    { id: "4", name: "Devon Lane", status: "offline" as const },
    { id: "5", name: "Eleanor Pena", status: "online" as const },
  ];

  return (
    <AppShell primaryActionLabel="Gallery Action">
      <div className="space-y-10 pb-12">
        {/* Gallery Intro Banner */}
        <section className="bg-gradient-to-r from-brand-purple/10 to-brand-navy/5 p-6 rounded-3xl border border-brand-purple/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-purple text-white mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 0 Milestone
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Design System & Component Gallery
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                High-fidelity preview of all design tokens, WCAG AA accessible color palettes,
                typography styles, and reusable Bento components matching the reference aesthetic.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setDemoPercentage((p) => (p >= 100 ? 25 : p + 25))}
                className="px-3.5 py-2 rounded-full bg-card border border-border-light text-xs font-bold text-text-primary hover:bg-card-subtle flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-purple" />
                Cycle Rings ({demoPercentage}%)
              </button>
            </div>
          </div>
        </section>

        {/* 1. Design Tokens & Palette */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span>1. Core Design Tokens & Palette (WCAG AA Certified)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-brand-purple text-white shadow-sm flex flex-col justify-between h-24">
              <span className="text-xs font-bold">Brand Purple</span>
              <span className="text-[11px] font-mono opacity-90">#6C5CE7</span>
            </div>
            <div className="p-4 rounded-2xl bg-brand-navy text-white shadow-sm flex flex-col justify-between h-24">
              <span className="text-xs font-bold">Brand Navy</span>
              <span className="text-[11px] font-mono opacity-90">#14123A</span>
            </div>
            <div className="p-4 rounded-2xl bg-canvas border border-border-light text-text-primary shadow-sm flex flex-col justify-between h-24">
              <span className="text-xs font-bold">Canvas Lavender</span>
              <span className="text-[11px] font-mono text-text-secondary">#D9DBEC</span>
            </div>
            <div className="p-4 rounded-2xl bg-status-success-bg text-status-success-text border border-status-success-dot/30 shadow-sm flex flex-col justify-between h-24">
              <span className="text-xs font-bold">Success Mint</span>
              <span className="text-[11px] font-mono">Contrast 5.2:1</span>
            </div>
            <div className="p-4 rounded-2xl bg-status-warning-bg text-status-warning-text border border-status-warning-dot/30 shadow-sm flex flex-col justify-between h-24">
              <span className="text-xs font-bold">Warning Amber</span>
              <span className="text-[11px] font-mono">Contrast 5.5:1</span>
            </div>
            <div className="p-4 rounded-2xl bg-status-danger-bg text-status-danger-text border border-status-danger-dot/30 shadow-sm flex flex-col justify-between h-24">
              <span className="text-xs font-bold">Danger Coral</span>
              <span className="text-[11px] font-mono">Contrast 5.8:1</span>
            </div>
          </div>
        </section>

        {/* 2. Status Pills & Badges */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">
            2. Status Pills & User Stacks
          </h2>
          <div className="p-6 rounded-3xl bg-card border border-border-light shadow-card flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status="present" />
              <StatusPill status="half_day" />
              <StatusPill status="absent" />
              <StatusPill status="holiday" />
              <StatusPill status="weekend" />
              <StatusPill status="leave" />
              <StatusPill status="pending" />
              <StatusPill status="approved" />
              <StatusPill status="rejected" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-text-secondary">
                Team Stack:
              </span>
              <AvatarStack users={mockUsers} max={3} />
            </div>
          </div>
        </section>

        {/* 3. Hero Check-in & Live Timer */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">
            3. Hero Check-In / Check-Out Component
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <HeroCheckInCard
                isCheckedIn={false}
                onCheckIn={() => toast.success("Checked in to session!")}
                onCheckOut={() => toast.info("Checked out of session!")}
              />
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <StatCard
                title="Today's Hours"
                value="06h 45m"
                subtitle="Goal: 08h 00m"
                progress={84}
                icon={<Clock className="w-4 h-4" />}
              />
              <StatCard
                title="Weekly Total"
                value="34h 15m"
                subtitle="3.5h remaining"
                progress={91}
                icon={<Calendar className="w-4 h-4" />}
              />
              <StatCard
                title="On-Time Rate"
                value="96.8%"
                trend={{ value: "+2.4%", isPositive: true, label: "vs last month" }}
                className="col-span-2"
                icon={<TrendingUp className="w-4 h-4" />}
              />
            </div>
          </div>
        </section>

        {/* 4. Session Breakdown & Circular Progress Rings */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">
            4. Today's Sessions, Progress Rings & Highlight Card
          </h2>
          <BentoGrid>
            {/* Today's Sessions List */}
            <BentoCard
              title="Today's Work Sessions"
              action={
                <button
                  type="button"
                  onClick={() => toast.message("Editing sessions")}
                  className="text-brand-purple hover:underline"
                >
                  Edit Sessions
                </button>
              }
              className="lg:col-span-5"
            >
              <div className="space-y-1">
                <SessionProgressRow
                  title="Morning Development Shift"
                  timestamp="09:00 AM - 01:15 PM"
                  duration="04 h 15 m"
                  percentage={100}
                  tags={["Core"]}
                />
                <SessionProgressRow
                  title="Architecture & Code Review"
                  timestamp="02:00 PM - 04:30 PM"
                  duration="02 h 30 m"
                  percentage={demoPercentage}
                  tags={["Review"]}
                />
                <SessionProgressRow
                  title="Team Sync & Wrap-up"
                  timestamp="05:00 PM - 05:45 PM"
                  duration="00 h 45 m"
                  percentage={60}
                  tags={["Meeting"]}
                />
              </div>
            </BentoCard>

            {/* Dual Animated Progress Rings */}
            <BentoCard
              title="Monthly Targets"
              subtitle="Hours marked vs target"
              className="lg:col-span-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-around py-4">
                <AnimatedProgressRing
                  percentage={demoPercentage}
                  title="Hours"
                  caption="You marked 152/160 hrs"
                  color="var(--brand-purple)"
                />
                <AnimatedProgressRing
                  percentage={75}
                  title="On-Time"
                  caption="18 of 20 days on time"
                  color="var(--status-success-dot)"
                />
              </div>
            </BentoCard>

            {/* Highlight Policy Card */}
            <HighlightCard
              title="Attendance Guidelines"
              description="Review company policies on grace periods, core working hours, and holiday schedules."
              buttonText="View Company Policy"
              onAction={() => toast.message("Opened company attendance policy")}
              className="lg:col-span-4"
            />
          </BentoGrid>
        </section>

        {/* 5. Calendar Strip & Notifications & Dashed Placeholders */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">
            5. Attendance Calendar, Notifications & Placeholders
          </h2>
          <BentoGrid>
            {/* Interactive Calendar Card */}
            <div className="lg:col-span-4">
              <AttendanceCalendarCard
                onSelectDate={(key) => toast.info(`Selected date: ${key}`)}
                onPrevMonth={() => toast.info("Navigated to previous month")}
                onNextMonth={() => toast.info("Navigated to next month")}
              />
            </div>

            {/* Notifications Card */}
            <BentoCard
              title="Notifications"
              action={
                <button
                  type="button"
                  onClick={() => toast.info("Notifications cleared")}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  Clear all
                </button>
              }
              className="lg:col-span-4"
            >
              <div className="space-y-3">
                <NotificationItem
                  title="Missed Checkout Warning"
                  description="System detected session running past 23:59. Auto-finalized."
                  date="Yesterday"
                  time="11:59 PM"
                  isUnread={true}
                  onEdit={() => toast.info("Edit correction requested")}
                  onDelete={() => toast.info("Notification dismissed")}
                />
                <NotificationItem
                  title="Regularization Approved"
                  description="Your manager approved the punch correction for Nov 3rd."
                  date="Nov 4"
                  time="10:15 AM"
                  onEdit={() => toast.info("Viewing details")}
                  onDelete={() => toast.info("Notification dismissed")}
                />
              </div>
            </BentoCard>

            {/* Regularizations / Dashed Card */}
            <BentoCard
              title="Regularization Requests"
              subtitle="Submit adjustments for approval"
              className="lg:col-span-4 flex flex-col justify-between"
            >
              <div className="space-y-2 mb-4">
                <div className="p-3 rounded-xl bg-card-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      Nov 5, 2026
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      Forgot checkout (Internet blackout)
                    </span>
                  </div>
                  <StatusPill status="pending" />
                </div>
                <div className="p-3 rounded-xl bg-card-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      Oct 28, 2026
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      Late check-in due to doctor appointment
                    </span>
                  </div>
                  <StatusPill status="approved" />
                </div>
              </div>

              <DashedAddCard
                label="Submit New Regularization"
                onClick={() => toast.message("Regularization modal opened")}
              />
            </BentoCard>
          </BentoGrid>
        </section>

        {/* 6. State Variants (Loading, Empty, Error) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">
            6. UI States (Skeleton Loading, Empty State, Error Fallback)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Loading Skeleton */}
            <BentoCard title="Loading State (Skeleton)" className="min-h-[160px]">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-card-subtle rounded-md w-3/4" />
                <div className="h-8 bg-card-subtle rounded-xl w-1/2" />
                <div className="h-2 bg-card-subtle rounded-full w-full" />
              </div>
            </BentoCard>

            {/* Empty State */}
            <BentoCard title="Empty State" className="min-h-[160px] text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-brand-purple-light flex items-center justify-center text-brand-purple mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-text-primary">
                No Pending Corrections
              </h4>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                All attendance logs are up to date!
              </p>
            </BentoCard>

            {/* Error State */}
            <BentoCard title="Error Fallback" className="min-h-[160px] text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-status-danger-bg flex items-center justify-center text-status-danger-text mb-2">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-status-danger-text">
                Failed to load data
              </h4>
              <button
                type="button"
                onClick={() => toast.success("Refetched successfully")}
                className="mt-2 text-xs font-bold text-brand-purple hover:underline"
              >
                Try Again
              </button>
            </BentoCard>
          </div>
        </section>
      </div>
    </AppShell>
  );
}


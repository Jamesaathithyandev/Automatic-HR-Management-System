"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { AvatarStack } from "@/components/shared/avatar-stack";
import { StatusPill } from "@/components/shared/status-pill";
import { HeroCheckInCard } from "@/features/attendance/components/hero-check-in-card";
import { StatCard } from "@/features/attendance/components/stat-card";
import { SessionProgressRow } from "@/features/attendance/components/session-progress-row";
import { AnimatedProgressRing } from "@/features/attendance/components/animated-progress-ring";
import { HighlightCard } from "@/features/attendance/components/highlight-card";
import { NotificationItem } from "@/features/attendance/components/notification-item";
import { DashedAddCard } from "@/features/attendance/components/dashed-add-card";
import { AttendanceCalendarCard } from "@/features/calendar/components/attendance-calendar-card";
import { useAttendanceToday } from "@/features/attendance/hooks/use-attendance-today";
import { useCheckIn } from "@/features/attendance/hooks/use-check-in";
import { useCheckOut } from "@/features/attendance/hooks/use-check-out";
import { useAttendanceTimer } from "@/features/attendance/hooks/use-attendance-timer";
import { formatDurationMinutes, formatTimeInTimezone } from "@/lib/date/timezone";
import {
  Clock,
  Calendar,
  Flame,
  CalendarDays,
  Share2,
  Edit2,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeDashboardPage() {
  const { data, isLoading, refetch } = useAttendanceToday();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const isCheckedIn = Boolean(data?.activeSession);
  const timer = useAttendanceTimer(data?.activeSession?.check_in_at);

  const teamAvatars = [
    { id: "1", name: "James Aathithyan", status: "online" as const },
    { id: "2", name: "Rachel Lee", status: "online" as const },
    { id: "3", name: "Ken Smith", status: "idle" as const },
  ];

  const handleTogglePunch = () => {
    if (isCheckedIn) {
      checkOutMutation.mutate();
    } else {
      checkInMutation.mutate("Regular day shift");
    }
  };

  const todayMinutes = data?.daySummary?.total_minutes || 0;
  const targetMinutes = data?.targetMinutes || 480;
  const todayProgress = Math.min(Math.round((todayMinutes / targetMinutes) * 100), 100);

  const weekMinutes = data?.weekTotalMinutes || todayMinutes;
  const weeklyTarget = targetMinutes * 5;
  const weekProgress = Math.min(Math.round((weekMinutes / weeklyTarget) * 100), 100);

  return (
    <AppShell
      primaryActionLabel={isCheckedIn ? "Check Out" : "Quick Check-in"}
      onPrimaryAction={handleTogglePunch}
    >
      <div className="space-y-6">
        {/* Header Greeting Row */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
                Hi, James!
              </h1>
              <AvatarStack users={teamAvatars} max={2} size="md" />
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              Ready to start your day? Today is{" "}
              <span className="font-bold text-text-primary">
                {data?.workDate || "Today"}
              </span>{" "}
              ({data?.timezone || "UTC"}). Target:{" "}
              <span className="font-bold text-brand-purple">
                {Math.floor(targetMinutes / 60)} hours
              </span>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-full bg-card border border-border-light text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors shadow-sm cursor-pointer"
              title="Refresh attendance records"
            >
              <RefreshCw className="w-4 h-4 text-brand-purple" />
            </button>
          </div>
        </section>

        {/* Row 1: Hero Action Card & Quick Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Hero Check-in Card */}
          <div className="lg:col-span-6">
            <HeroCheckInCard
              isCheckedIn={isCheckedIn}
              activeTime={timer.formattedTime}
              workDate={data?.workDate || "Today"}
              targetMinutes={targetMinutes}
              isLoading={checkInMutation.isPending || checkOutMutation.isPending || isLoading}
              onCheckIn={() => checkInMutation.mutate("Morning shift punch")}
              onCheckOut={() => checkOutMutation.mutate()}
            />
          </div>

          {/* 3 Metric Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Today's Hours"
              value={formatDurationMinutes(todayMinutes)}
              subtitle={`Goal: ${formatDurationMinutes(targetMinutes)}`}
              progress={todayProgress}
              icon={<Clock className="w-4 h-4" />}
            />
            <StatCard
              title="Week Total"
              value={formatDurationMinutes(weekMinutes)}
              subtitle={`${weekProgress}% completed`}
              progress={weekProgress}
              icon={<Calendar className="w-4 h-4" />}
            />
            <StatCard
              title="On-Time Streak"
              value={`${data?.streakDays || 14} Days`}
              subtitle="Top 5% in engineering"
              trend={{ value: "+3 days", isPositive: true }}
              icon={<Flame className="w-4 h-4 text-status-warning-dot" />}
            />
          </div>
        </div>

        {/* Row 2: Notifications, Requests & Monthly Calendar */}
        <BentoGrid>
          {/* Notifications Card */}
          <BentoCard
            title="Notifications"
            action={
              <button
                type="button"
                onClick={() => toast.info("Notifications cleared")}
                className="text-text-tertiary hover:text-text-primary font-semibold text-xs cursor-pointer"
              >
                Clear
              </button>
            }
            className="lg:col-span-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <NotificationItem
                title="Upcoming Event"
                description="Engineering All-Hands | Time: 45 min"
                date="Today"
                time="11:00 AM - 11:45 AM"
                isUnread={true}
                onEdit={() => toast.info("Event opened")}
                onDelete={() => toast.info("Dismissed")}
              />
              <NotificationItem
                title="Message | People Ops"
                description="Quarterly holiday schedule released for remote teams."
                date="Yesterday"
                onEdit={() => toast.info("Reading announcement")}
                onDelete={() => toast.info("Dismissed")}
              />
            </div>
          </BentoCard>

          {/* Regularization Requests */}
          <BentoCard
            title="Regularization Requests"
            action={
              <button
                type="button"
                onClick={() => toast.info("Editing requests")}
                className="text-text-tertiary hover:text-text-primary flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            }
            className="lg:col-span-4 flex flex-col justify-between"
          >
            <div className="space-y-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-card border border-border-light shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-text-tertiary uppercase">
                    Missed Punch
                  </span>
                  <StatusPill status="pending" />
                </div>
                <h4 className="text-xs font-bold text-text-primary">
                  Nov 5, 2026: Wi-Fi outage during evening checkout
                </h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
                  <span>Req: 06:00 PM</span>
                  <span className="font-semibold text-brand-purple">
                    Pending review
                  </span>
                </div>
              </div>
            </div>

            <DashedAddCard
              label="Add new request"
              onClick={() => toast.message("Regularization request modal opened")}
            />
          </BentoCard>

          {/* Attendance Calendar Card */}
          <div className="lg:col-span-4">
            <AttendanceCalendarCard
              currentMonth="November 2026 • கார்த்திகை"
              onSelectDate={(key) => toast.info(`Viewing agenda for ${key}`)}
            />
          </div>
        </BentoGrid>

        {/* Row 3: Today's Sessions, Highlight Card, Rings & Next Event */}
        <BentoGrid>
          {/* Today Tasks / Sessions List */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <span>Today's Sessions</span>
                <AvatarStack users={teamAvatars} max={3} size="sm" />
              </div>
            }
            action={
              <div className="flex items-center gap-2 text-text-tertiary">
                <button
                  type="button"
                  title="Share"
                  onClick={() => toast.info("Link copied")}
                  className="p-1 hover:text-text-primary cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Edit"
                  onClick={() => toast.info("Edit sessions")}
                  className="p-1 hover:text-text-primary cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            }
            className="lg:col-span-5"
          >
            <div className="space-y-1">
              {(data?.sessions || []).length > 0 ? (
                data!.sessions.map((sess) => {
                  const checkInTime = formatTimeInTimezone(
                    sess.check_in_at,
                    data?.timezone || "UTC"
                  );
                  const checkOutTime = sess.check_out_at
                    ? formatTimeInTimezone(
                        sess.check_out_at,
                        data?.timezone || "UTC"
                      )
                    : "In Progress";

                  const diffMins = sess.check_out_at
                    ? Math.round(
                        (new Date(sess.check_out_at).getTime() -
                          new Date(sess.check_in_at).getTime()) /
                          (60 * 1000)
                      )
                    : Math.round(timer.elapsedSeconds / 60);

                  const sessPct = Math.min(
                    Math.round((diffMins / (targetMinutes / 2)) * 100),
                    100
                  );

                  return (
                    <SessionProgressRow
                      key={sess.id}
                      title={sess.note || "Work Session"}
                      timestamp={`${checkInTime} - ${checkOutTime}`}
                      duration={formatDurationMinutes(diffMins)}
                      percentage={sessPct}
                      tags={[sess.source]}
                    />
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-text-tertiary font-medium">
                  No sessions recorded today yet. Click "Check In" to begin!
                </div>
              )}
            </div>
          </BentoCard>

          {/* Highlight Policy Card */}
          <HighlightCard
            title="HR Attendance Tip"
            description="Remote employees who record punch entries within 15 minutes of shift start qualify for the monthly punctuality badge!"
            buttonText="Read Shift Policy"
            onAction={() => toast.info("Viewing company shift policy")}
            className="lg:col-span-3"
          />

          {/* Dual Animated Progress Rings */}
          <BentoCard
            title="Monthly Targets"
            className="lg:col-span-2 flex flex-col justify-between text-center"
          >
            <div className="flex flex-col items-center justify-around gap-4 py-2">
              <AnimatedProgressRing
                percentage={todayProgress}
                size={90}
                strokeWidth={7}
                title="Shift Target"
                caption={`${todayMinutes}/${targetMinutes} mins`}
                color="var(--brand-purple)"
              />
            </div>
          </BentoCard>

          {/* Upcoming Event / Holiday Card */}
          <BentoCard
            title="Upcoming Holiday"
            action={
              <button
                type="button"
                onClick={() => toast.info("Viewing calendar")}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            }
            className="lg:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs text-brand-purple font-semibold mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Nov 08, 2026 (IST)</span>
              </div>
              <h4 className="text-sm font-bold text-text-primary">
                Deepavali (தீபாவளி பண்டிகை)
              </h4>
              <p className="text-xs text-text-tertiary mt-1">
                Tamil Nadu Gazetted Public Holiday. All attendance punches excused.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-light flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.success("Holiday acknowledged!")}
                className="w-full py-2 px-3 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </AppShell>
  );
}

"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { StatCard } from "@/features/attendance/components/stat-card";
import { StatusPill } from "@/components/shared/status-pill";
import { AvatarStack } from "@/components/shared/avatar-stack";
import {
  useRegularizations,
  useApproveRegularization,
  useRejectRegularization,
} from "@/features/requests/hooks/use-regularizations";
import { formatDurationMinutes } from "@/lib/date/timezone";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Sparkles,
  Calendar,
  Activity,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeamMemberRosterItem {
  id: string;
  name: string;
  role: string;
  timezone: string;
  checkInTime: string;
  loggedMinutes: number;
  status: "online" | "idle" | "offline";
  dayStatus: "present" | "half_day" | "absent" | "leave";
}

const mockTeamRoster: TeamMemberRosterItem[] = [
  {
    id: "tm-1",
    name: "Rachel Lee",
    role: "Senior Frontend Engineer",
    timezone: "America/New_York",
    checkInTime: "09:02 AM",
    loggedMinutes: 420,
    status: "online",
    dayStatus: "present",
  },
  {
    id: "tm-2",
    name: "Ken Smith",
    role: "Backend Architect",
    timezone: "Europe/London",
    checkInTime: "08:45 AM",
    loggedMinutes: 480,
    status: "idle",
    dayStatus: "present",
  },
  {
    id: "tm-3",
    name: "Eleanor Pena",
    role: "UI/UX Product Designer",
    timezone: "Asia/Kolkata",
    checkInTime: "10:15 AM",
    loggedMinutes: 240,
    status: "online",
    dayStatus: "half_day",
  },
  {
    id: "tm-4",
    name: "Devon Lane",
    role: "QA Automation Engineer",
    timezone: "America/Chicago",
    checkInTime: "--:--",
    loggedMinutes: 0,
    status: "offline",
    dayStatus: "leave",
  },
];

export default function ManagerDashboardPage() {
  const { data: requests, refetch } = useRegularizations();
  const approveMutation = useApproveRegularization();
  const rejectMutation = useRejectRegularization();

  const pendingRequests = (requests || []).filter((r) => r.status === "pending");

  const onlineCount = mockTeamRoster.filter((m) => m.status === "online").length;
  const totalReports = mockTeamRoster.length;

  return (
    <AppShell primaryActionLabel="Team Standup" userRole="manager">
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Manager Team Hub
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple-light text-brand-purple flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-success-dot animate-pulse" />
                {onlineCount} Online Now
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Real-time team presence, attendance compliance, and pending correction approvals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AvatarStack
              users={mockTeamRoster.map((m) => ({
                id: m.id,
                name: m.name,
                status: m.status,
              }))}
              max={4}
              size="md"
            />
          </div>
        </section>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Team Online"
            value={`${onlineCount}/${totalReports}`}
            subtitle="75% active punch rate"
            icon={<Activity className="w-4 h-4 text-status-success-dot" />}
          />
          <StatCard
            title="Avg Hours Today"
            value="06h 15m"
            subtitle="Target: 08h 00m"
            progress={78}
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            title="On-Time Rate"
            value="94.2%"
            subtitle="Team punctuality score"
            trend={{ value: "+1.8%", isPositive: true }}
            icon={<CheckCircle2 className="w-4 h-4 text-brand-purple" />}
          />
          <StatCard
            title="Pending Requests"
            value={`${pendingRequests.length}`}
            subtitle="Awaiting your approval"
            icon={<AlertCircle className="w-4 h-4 text-status-warning-dot" />}
          />
        </div>

        {/* Bento Grid: Team Roster + Approvals Queue */}
        <BentoGrid>
          {/* Left: Team Today Roster */}
          <BentoCard
            title="Team Attendance Today"
            subtitle="Real-time employee working sessions and status"
            className="lg:col-span-7 p-6"
          >
            <div className="space-y-3">
              {mockTeamRoster.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-card-subtle border border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-card transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-brand-purple-light flex items-center justify-center font-bold text-xs text-brand-purple uppercase">
                        {member.name.slice(0, 2)}
                      </div>
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-card",
                          member.status === "online"
                            ? "bg-status-success-dot"
                            : member.status === "idle"
                            ? "bg-status-warning-dot"
                            : "bg-text-tertiary"
                        )}
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-text-primary">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-text-tertiary">
                        {member.role} • {member.timezone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                        Check-in: {member.checkInTime}
                      </span>
                      <span className="text-xs font-extrabold text-text-primary font-mono">
                        {formatDurationMinutes(member.loggedMinutes)}
                      </span>
                    </div>

                    <StatusPill status={member.dayStatus} />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Right: Pending Approvals Queue */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <span>Pending Approvals</span>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-warning-dot text-brand-navy">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            }
            subtitle="Regularization requests from your direct reports"
            className="lg:col-span-5 p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-card-subtle border border-border-light shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-text-primary">
                        {req.employee_name || "Direct Report"}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-brand-purple">
                        {req.work_date}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary bg-card p-2.5 rounded-xl border border-border-light my-2">
                      {req.reason}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light/60">
                      <button
                        type="button"
                        onClick={() =>
                          rejectMutation.mutate({
                            requestId: req.id,
                            reviewNote: "Declined by manager",
                          })
                        }
                        className="px-3 py-1.5 rounded-xl border border-status-danger-dot/40 text-status-danger-text hover:bg-status-danger-bg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          approveMutation.mutate({
                            requestId: req.id,
                            reviewNote: "Approved by manager",
                          })
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center rounded-2xl bg-card-subtle/40 flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 rounded-full bg-brand-purple-light flex items-center justify-center text-brand-purple mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">
                    Approvals Queue Clear!
                  </h4>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    No pending corrections requiring your review.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border-light mt-4 text-[11px] text-text-tertiary flex items-center justify-between">
              <span>All approvals logged to audit trail</span>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-brand-purple font-bold hover:underline"
              >
                Refresh
              </button>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </AppShell>
  );
}


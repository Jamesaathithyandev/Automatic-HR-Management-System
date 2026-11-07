"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { StatusPill } from "@/components/shared/status-pill";
import { StatCard } from "@/features/attendance/components/stat-card";
import { RequestModal } from "@/features/requests/components/request-modal";
import { useSubmitRegularization } from "@/features/requests/hooks/use-regularizations";
import { formatDurationMinutes, formatTimeInTimezone } from "@/lib/date/timezone";
import {
  getTamilNaduHoliday,
  getTamilMonthInfo,
  TamilNaduHoliday,
} from "@/lib/date/holidays-tn";
import { AttendanceDayStatus } from "@/types/database.types";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Lock,
  PlusCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MockCalendarDay {
  dateKey: string;
  dayNumber: number;
  dayName: string;
  status: AttendanceDayStatus;
  totalMinutes: number;
  isLate: boolean;
  locked: boolean;
  holidayInfo?: TamilNaduHoliday;
  sessions: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    duration: number;
    source: "web" | "auto" | "manual";
  }>;
}

// Generate month days with authentic Tamil Nadu holidays and realistic shift schedules
function generateMonthDays(year: number, month: number): MockCalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const list: MockCalendarDay[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    const dateKey = `${year}-${month.toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;

    const tnHoliday = getTamilNaduHoliday(dateKey);

    let status: AttendanceDayStatus = "present";
    let minutes = 495; // ~8h 15m
    let isLate = false;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (tnHoliday) {
      status = "holiday";
      minutes = 0;
    } else if (isWeekend) {
      status = "weekend";
      minutes = 0;
    } else if (i === 12) {
      status = "half_day";
      minutes = 240;
    } else if (i === 24) {
      status = "leave";
      minutes = 0;
    } else if (i === 5) {
      isLate = true;
    }

    list.push({
      dateKey,
      dayNumber: i,
      dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek],
      status,
      totalMinutes: minutes,
      isLate,
      locked: i < 5,
      holidayInfo: tnHoliday,
      sessions:
        minutes > 0
          ? [
              {
                id: `sess-${i}-1`,
                checkIn: `${dateKey}T09:00:00Z`,
                checkOut: `${dateKey}T13:00:00Z`,
                duration: 240,
                source: "web",
              },
              {
                id: `sess-${i}-2`,
                checkIn: `${dateKey}T14:00:00Z`,
                checkOut: `${dateKey}T${14 + Math.floor((minutes - 240) / 60)}:15:00Z`,
                duration: minutes - 240,
                source: "web",
              },
            ]
          : [],
    });
  }

  return list;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AttendanceCalendarPage() {
  const [selectedMonth, setSelectedMonth] = React.useState(11); // November
  const [selectedYear, setSelectedYear] = React.useState(2026);
  const monthDays = React.useMemo(
    () => generateMonthDays(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const [selectedDayKey, setSelectedDayKey] = React.useState<string>(
    monthDays[6]?.dateKey || "2026-11-07"
  );
  const [requestModalOpen, setRequestModalOpen] = React.useState(false);
  const submitRegularizationMutation = useSubmitRegularization();

  const selectedDay =
    monthDays.find((d) => d.dateKey === selectedDayKey) || monthDays[0];

  const totalPresent = monthDays.filter((d) => d.status === "present").length;
  const totalHalfDays = monthDays.filter((d) => d.status === "half_day").length;
  const totalHolidays = monthDays.filter((d) => d.status === "holiday").length;
  const totalLates = monthDays.filter((d) => d.isLate).length;
  const totalHours = Math.round(
    monthDays.reduce((acc, curr) => acc + curr.totalMinutes, 0) / 60
  );

  const tamilMonthInfo = React.useMemo(() => {
    return getTamilMonthInfo(new Date(selectedYear, selectedMonth - 1, 15));
  }, [selectedYear, selectedMonth]);

  const statusDotClass = {
    present: "bg-status-success-dot",
    half_day: "bg-status-warning-dot",
    absent: "bg-status-danger-dot",
    holiday: "bg-brand-purple",
    weekend: "bg-text-tertiary/30",
    leave: "bg-status-info-dot",
  };

  return (
    <AppShell
      primaryActionLabel="Regularize Day"
      onPrimaryAction={() => setRequestModalOpen(true)}
    >
      <div className="space-y-6">
        {/* Header & Month Navigator */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Attendance Calendar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-purple-light text-brand-purple text-[11px] font-bold border border-brand-purple/20">
                Tamil Nadu Calendar (IST)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Monthly punch records, regional public holidays, and timesheet regularization.
            </p>
          </div>

          {/* Month Switcher with Tamil Month Name */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (selectedMonth === 1) {
                  setSelectedMonth(12);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              className="p-2 rounded-full bg-card border border-border-light text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors shadow-sm cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl bg-card-subtle border border-border-light text-center min-w-[170px]">
              <span className="text-xs font-bold text-text-primary">
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </span>
              <span className="text-[10px] font-bold text-brand-purple">
                {tamilMonthInfo.tamil} ({tamilMonthInfo.english})
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedMonth === 12) {
                  setSelectedMonth(1);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              className="p-2 rounded-full bg-card border border-border-light text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors shadow-sm cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Hours"
            value={`${totalHours} hrs`}
            subtitle="Target: 160 hrs (IST)"
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            title="Days Present"
            value={`${totalPresent} Days`}
            subtitle="Regular shift on schedule"
            icon={<CheckCircle2 className="w-4 h-4 text-status-success-dot" />}
          />
          <StatCard
            title="TN Holidays"
            value={`${totalHolidays}`}
            subtitle="Tamil Nadu Gazetted"
            icon={<Sparkles className="w-4 h-4 text-brand-purple" />}
          />
          <StatCard
            title="Late Arrivals"
            value={`${totalLates}`}
            subtitle="Within 15m grace period"
            icon={<AlertCircle className="w-4 h-4 text-status-warning-dot" />}
          />
        </div>

        {/* Calendar Grid + Detailed Day Agenda */}
        <BentoGrid>
          {/* Left: Full Monthly Grid View */}
          <BentoCard
            title="Monthly Timesheet Grid"
            subtitle="Click any date to inspect shift punches and Tamil Nadu festivals"
            className="lg:col-span-8 p-6"
          >
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-tertiary uppercase pb-3 border-b border-border-light/60">
              <span className="text-status-danger-text/80">Sun (ஞாயிறு)</span>
              <span>Mon (திங்கள்)</span>
              <span>Tue (செவ்வாய்)</span>
              <span>Wed (புதன்)</span>
              <span>Thu (வியாழன்)</span>
              <span>Fri (வெள்ளி)</span>
              <span className="text-status-danger-text/80">Sat (சனி)</span>
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-2 pt-3">
              {monthDays.map((day) => {
                const isSelected = day.dateKey === selectedDayKey;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => setSelectedDayKey(day.dateKey)}
                    className={cn(
                      "h-20 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative",
                      isSelected
                        ? "border-brand-purple bg-brand-purple/10 shadow-sm"
                        : "border-border-light/60 bg-card hover:bg-card-subtle/70",
                      day.status === "weekend" && "opacity-85 bg-card-subtle/30"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                          isSelected
                            ? "bg-brand-purple text-white"
                            : "text-text-primary"
                        )}
                      >
                        {day.dayNumber}
                      </span>
                      {day.locked && (
                        <span title="Finalized and locked">
                          <Lock className="w-3 h-3 text-text-tertiary/60" />
                        </span>
                      )}
                    </div>

                    {/* Holiday Chip or Duration Label */}
                    <div className="w-full">
                      {day.holidayInfo ? (
                        <span className="text-[9px] font-bold text-brand-purple line-clamp-1 block leading-tight">
                          🎉 {day.holidayInfo.nameTa.split(" ")[0]}
                        </span>
                      ) : day.status !== "weekend" && day.totalMinutes > 0 ? (
                        <span className="text-[10px] font-mono font-semibold text-text-secondary">
                          {formatDurationMinutes(day.totalMinutes)}
                        </span>
                      ) : null}

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            statusDotClass[day.status]
                          )}
                        />
                        <span className="text-[10px] font-medium text-text-tertiary capitalize truncate">
                          {day.holidayInfo ? "Holiday" : day.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend Footer */}
            <div className="flex flex-wrap items-center gap-4 pt-5 mt-4 border-t border-border-light/60 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-success-dot" />
                Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-warning-dot" />
                Half Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-danger-dot" />
                Absent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                Tamil Nadu Holiday (விடுமுறை)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-info-dot" />
                Approved Leave
              </span>
            </div>
          </BentoCard>

          {/* Right: Detailed Day Breakdown Card */}
          <BentoCard
            title={`Details for ${selectedDay.dateKey}`}
            action={<StatusPill status={selectedDay.status} />}
            className="lg:col-span-4 p-6 flex flex-col justify-between"
          >
            <div>
              {/* If Selected Date is a Tamil Nadu Holiday */}
              {selectedDay.holidayInfo && (
                <div className="p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 mb-4 select-none">
                  <div className="flex items-center gap-2 text-brand-purple font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>{selectedDay.holidayInfo.nameEn}</span>
                  </div>
                  <p className="text-xs text-text-primary font-semibold mt-1">
                    {selectedDay.holidayInfo.nameTa}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1">
                    {selectedDay.holidayInfo.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-brand-purple text-white text-[10px] font-bold">
                      {selectedDay.holidayInfo.region === "TN"
                        ? "தமிழ்நாடு அரசு விடுமுறை"
                        : "தேசிய விடுமுறை"}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      Paid Public Holiday
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-card-subtle mb-4 border border-border-light flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-text-tertiary uppercase">
                    Logged Duration
                  </span>
                  <div className="text-2xl font-extrabold text-text-primary tracking-tight font-mono">
                    {formatDurationMinutes(selectedDay.totalMinutes)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-text-tertiary uppercase">
                    Late Arrival
                  </span>
                  <div
                    className={cn(
                      "text-xs font-bold mt-1",
                      selectedDay.isLate
                        ? "text-status-warning-text"
                        : "text-status-success-text"
                    )}
                  >
                    {selectedDay.isLate ? "Yes (Past grace)" : "On Time"}
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Session Intervals
              </h4>

              {selectedDay.sessions.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {selectedDay.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded-xl bg-card border border-border-light shadow-sm flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-text-primary block font-mono">
                          {formatTimeInTimezone(sess.checkIn, "Asia/Kolkata", "hh:mm a")} -{" "}
                          {formatTimeInTimezone(sess.checkOut, "Asia/Kolkata", "hh:mm a")} IST
                        </span>
                        <span className="text-[10px] text-text-tertiary capitalize">
                          Source: {sess.source}
                        </span>
                      </div>
                      <span className="font-bold text-brand-purple">
                        {formatDurationMinutes(sess.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-text-tertiary bg-card-subtle/50 rounded-xl mb-4">
                  {selectedDay.holidayInfo
                    ? `No punches required on ${selectedDay.holidayInfo.nameEn}.`
                    : `No working sessions on this date (${selectedDay.status}).`}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border-light">
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-border-light/20"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Regularize This Day</span>
              </button>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Regularization Modal */}
        <RequestModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
          initialDate={selectedDay.dateKey}
          onSubmitRequest={async (data) => {
            await submitRegularizationMutation.mutateAsync(data);
          }}
        />
      </div>
    </AppShell>
  );
}

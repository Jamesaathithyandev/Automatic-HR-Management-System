"use client";

import * as React from "react";
import { BentoCard } from "@/components/bento/bento-card";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayStripItem {
  dayName: string;
  dateNumber: number;
  dateKey: string;
  status?: "present" | "half_day" | "absent" | "holiday" | "weekend" | "leave";
  isSelected?: boolean;
}

interface AgendaItem {
  id: string;
  timeSlot: string;
  title: string;
  category?: string;
}

interface AttendanceCalendarCardProps {
  currentMonth?: string;
  days?: DayStripItem[];
  agenda?: AgendaItem[];
  onSelectDate?: (dateKey: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  className?: string;
}

const mockDefaultDays: DayStripItem[] = [
  { dayName: "Fri", dateNumber: 6, dateKey: "2026-11-06", status: "present" },
  { dayName: "Sat", dateNumber: 7, dateKey: "2026-11-07", status: "weekend" },
  { dayName: "Sun", dateNumber: 8, dateKey: "2026-11-08", status: "holiday", isSelected: true },
  { dayName: "Mon", dateNumber: 9, dateKey: "2026-11-09", status: "present" },
  { dayName: "Tue", dateNumber: 10, dateKey: "2026-11-10", status: "present" },
  { dayName: "Wed", dateNumber: 11, dateKey: "2026-11-11", status: "present" },
  { dayName: "Thu", dateNumber: 12, dateKey: "2026-11-12", status: "half_day" },
];

const mockDefaultAgenda: AgendaItem[] = [
  {
    id: "1",
    timeSlot: "Full Day Excused",
    title: "Deepavali Festival (தீபாவளி பண்டிகை)",
    category: "TN Gazetted Holiday",
  },
  {
    id: "2",
    timeSlot: "Next Shift: Mon 09:30 AM",
    title: "Standard Shift (IST)",
    category: "Chennai Office / Remote",
  },
];

export function AttendanceCalendarCard({
  currentMonth = "November 2026 • கார்த்திகை",
  days = mockDefaultDays,
  agenda = mockDefaultAgenda,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  className,
}: AttendanceCalendarCardProps) {
  const [selectedKey, setSelectedKey] = React.useState<string>(
    days.find((d) => d.isSelected)?.dateKey || days[0]?.dateKey || ""
  );

  const handleSelect = (d: DayStripItem) => {
    setSelectedKey(d.dateKey);
    onSelectDate?.(d.dateKey);
  };

  const statusDotClass = {
    present: "bg-status-success-dot",
    half_day: "bg-status-warning-dot",
    absent: "bg-status-danger-dot",
    holiday: "bg-brand-purple",
    weekend: "bg-text-tertiary/40",
    leave: "bg-status-info-dot",
  };

  return (
    <BentoCard
      title={
        <div className="flex items-center justify-between w-full">
          <span className="text-base font-bold text-text-primary tracking-tight">
            {currentMonth}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevMonth}
              title="Previous month"
              className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              title="Next month"
              className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      }
      className={cn("p-5 justify-between", className)}
    >
      {/* 7-Day Week Strip */}
      <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-border-light/60">
        {days.map((item) => {
          const isSelected = item.dateKey === selectedKey;
          return (
            <button
              key={item.dateKey}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex flex-col items-center gap-1 group py-1 cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-text-tertiary group-hover:text-text-primary">
                {item.dayName}
              </span>

              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isSelected
                    ? "bg-brand-purple text-white shadow-sm scale-105"
                    : "text-text-primary hover:bg-card-subtle"
                )}
              >
                {item.dateNumber}
              </div>

              {item.status && (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    statusDotClass[item.status] || "bg-transparent"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda List */}
      <div className="mt-4 space-y-3">
        {agenda.map((slot) => (
          <div
            key={slot.id}
            className="group flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-card-subtle/70 transition-colors"
          >
            <div>
              <span className="text-[11px] font-bold tracking-wider text-text-tertiary block font-mono">
                {slot.timeSlot}
              </span>
              <h5 className="text-xs font-bold text-text-primary mt-0.5">
                {slot.title}
              </h5>
              {slot.category && (
                <span className="text-[10px] text-brand-purple font-semibold">
                  {slot.category}
                </span>
              )}
            </div>

            <button
              type="button"
              title="Session options"
              className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}


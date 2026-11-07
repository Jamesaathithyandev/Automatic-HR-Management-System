import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, Calendar, Coffee, FileText } from "lucide-react";

export type AttendanceStatusType =
  | "present"
  | "half_day"
  | "absent"
  | "holiday"
  | "weekend"
  | "leave"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "on_leave";

interface StatusPillProps {
  status: AttendanceStatusType | string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: React.ElementType }
> = {
  present: {
    label: "Present",
    bg: "bg-status-success-bg",
    text: "text-status-success-text",
    dot: "bg-status-success-dot",
    icon: CheckCircle2,
  },
  approved: {
    label: "Approved",
    bg: "bg-status-success-bg",
    text: "text-status-success-text",
    dot: "bg-status-success-dot",
    icon: CheckCircle2,
  },
  active: {
    label: "Active",
    bg: "bg-status-success-bg",
    text: "text-status-success-text",
    dot: "bg-status-success-dot",
    icon: CheckCircle2,
  },
  half_day: {
    label: "Half Day",
    bg: "bg-status-warning-bg",
    text: "text-status-warning-text",
    dot: "bg-status-warning-dot",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    bg: "bg-status-warning-bg",
    text: "text-status-warning-text",
    dot: "bg-status-warning-dot",
    icon: Clock,
  },
  absent: {
    label: "Absent",
    bg: "bg-status-danger-bg",
    text: "text-status-danger-text",
    dot: "bg-status-danger-dot",
    icon: AlertCircle,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-status-danger-bg",
    text: "text-status-danger-text",
    dot: "bg-status-danger-dot",
    icon: AlertCircle,
  },
  holiday: {
    label: "Holiday",
    bg: "bg-brand-purple-light",
    text: "text-brand-purple",
    dot: "bg-brand-purple",
    icon: Calendar,
  },
  weekend: {
    label: "Weekend",
    bg: "bg-card-subtle",
    text: "text-text-secondary",
    dot: "bg-text-tertiary",
    icon: Coffee,
  },
  leave: {
    label: "On Leave",
    bg: "bg-status-info-bg",
    text: "text-status-info-text",
    dot: "bg-status-info-dot",
    icon: FileText,
  },
  on_leave: {
    label: "On Leave",
    bg: "bg-status-info-bg",
    text: "text-status-info-text",
    dot: "bg-status-info-dot",
    icon: FileText,
  },
};

export function StatusPill({ status, label, className, showIcon = true }: StatusPillProps) {
  const normalizedKey = status.toLowerCase();
  const config = statusConfig[normalizedKey] || {
    label: label || status,
    bg: "bg-card-subtle",
    text: "text-text-secondary",
    dot: "bg-text-tertiary",
    icon: Clock,
  };

  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-transparent select-none",
        config.bg,
        config.text,
        className
      )}
    >
      {showIcon ? (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      ) : null}
      <span>{displayLabel}</span>
    </span>
  );
}


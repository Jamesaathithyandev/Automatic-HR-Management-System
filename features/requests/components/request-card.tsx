"use client";

import * as React from "react";
import { RegularizationRequestItem } from "@/features/requests/types";
import { StatusPill } from "@/components/shared/status-pill";
import { Calendar, Clock, MessageSquare, Check, X } from "lucide-react";
import { formatTimeInTimezone } from "@/lib/date/timezone";
import { cn } from "@/lib/utils";

interface RequestCardProps {
  request: RegularizationRequestItem;
  canReview?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

export function RequestCard({
  request,
  canReview = false,
  onApprove,
  onReject,
  className,
}: RequestCardProps) {
  const isPending = request.status === "pending";

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-card border border-border-light shadow-card hover:shadow-float transition-all duration-200 flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-text-primary">
              <Calendar className="w-3.5 h-3.5 text-brand-purple" />
              {request.work_date}
            </span>
            {request.employee_name && (
              <span className="text-xs font-semibold text-text-secondary">
                • {request.employee_name}
              </span>
            )}
          </div>
          <StatusPill status={request.status} />
        </div>

        <div className="flex items-center gap-3 text-xs text-text-tertiary font-mono my-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-purple" />
            {formatTimeInTimezone(request.requested_in, "UTC", "hh:mm a")} -{" "}
            {formatTimeInTimezone(request.requested_out, "UTC", "hh:mm a")}
          </span>
        </div>

        <div className="bg-card-subtle p-3 rounded-xl text-xs text-text-secondary mt-2">
          <span className="font-bold text-text-primary block text-[11px] mb-0.5">
            Reason:
          </span>
          {request.reason}
        </div>

        {request.review_note && (
          <div className="mt-2 text-xs text-brand-purple font-medium flex items-start gap-1">
            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Note: {request.review_note}</span>
          </div>
        )}
      </div>

      {/* Review Actions if Manager or HR */}
      {canReview && isPending && (
        <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onReject?.(request.id)}
            className="px-3.5 py-1.5 rounded-xl border border-status-danger-dot/40 text-status-danger-text hover:bg-status-danger-bg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
          <button
            type="button"
            onClick={() => onApprove?.(request.id)}
            className="px-3.5 py-1.5 rounded-xl bg-status-success-bg border border-status-success-dot/40 text-status-success-text hover:bg-status-success-bg/80 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve</span>
          </button>
        </div>
      )}
    </div>
  );
}


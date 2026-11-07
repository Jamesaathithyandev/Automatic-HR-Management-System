"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Trash2, Edit3, MoreHorizontal } from "lucide-react";

interface NotificationItemProps {
  title: string;
  description: string;
  date?: string;
  time?: string;
  isUnread?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function NotificationItem({
  title,
  description,
  date,
  time,
  isUnread = false,
  onEdit,
  onDelete,
  className,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "group relative p-4 rounded-2xl bg-card border border-border-light shadow-sm hover:shadow-card transition-all duration-200",
        isUnread && "border-brand-purple/40 bg-brand-purple-light/10",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-text-primary truncate">{title}</h4>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-brand-purple shrink-0" />
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
            {description}
          </p>

          {(date || time) && (
            <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-text-tertiary">
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-purple" />
                  {date}
                </span>
              )}
              {time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-purple" />
                  {time}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover Action Toolbar */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit"
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="p-1.5 rounded-lg text-text-tertiary hover:text-status-danger-text hover:bg-status-danger-bg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            title="Options"
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


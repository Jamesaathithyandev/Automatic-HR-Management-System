"use client";

import * as React from "react";
import { Bell, Check, Trash2, X, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface NotificationRecord {
  id: string;
  type: "missed_checkout" | "request_status" | "policy_update" | "reminder";
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({
  open,
  onOpenChange,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<
    NotificationRecord[]
  >([
    {
      id: "n-1",
      type: "missed_checkout",
      title: "Auto-Checkout Warning",
      body: "Your session on Nov 6 was automatically closed past midnight.",
      read_at: null,
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
    {
      id: "n-2",
      type: "request_status",
      title: "Regularization Approved",
      body: "Manager approved punch correction for 2026-11-05.",
      read_at: null,
      created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    },
    {
      id: "n-3",
      type: "policy_update",
      title: "Quarterly Holiday Schedule",
      body: "Thanksgiving holiday schedule is now updated.",
      read_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    },
  ]);

  if (!open) return null;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info("Notifications cleared");
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/20 backdrop-blur-xs animate-in fade-in-0">
      <div
        className="w-full max-w-sm bg-card rounded-[28px] shadow-shell border border-border-light p-5 relative overflow-hidden mt-12"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-light/60 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-purple" />
            <h4 className="text-sm font-extrabold text-text-primary">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-purple text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1 rounded text-text-tertiary hover:text-text-primary text-xs font-semibold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={clearAll}
              title="Clear all"
              className="p-1 rounded text-text-tertiary hover:text-status-danger-text text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const isUnread = !n.read_at;

              return (
                <div
                  key={n.id}
                  onClick={() => markSingleRead(n.id)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all cursor-pointer relative",
                    isUnread
                      ? "bg-brand-purple-light/20 border-brand-purple/30"
                      : "bg-card-subtle/70 border-border-light/60 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      {n.type === "missed_checkout" ? (
                        <AlertCircle className="w-3.5 h-3.5 text-status-warning-dot shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                      )}
                      <span>{n.title}</span>
                    </h5>
                    {isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                    {n.body}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-text-tertiary">
              You are all caught up! No notifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


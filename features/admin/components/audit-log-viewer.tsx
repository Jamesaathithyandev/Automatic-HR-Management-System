"use client";

import * as React from "react";
import { BentoCard } from "@/components/bento/bento-card";
import { Shield, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface AuditLogItem {
  id: string;
  actor_id: string | null;
  actor_name?: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  created_at: string;
}

const mockAuditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    actor_id: "mgr-1",
    actor_name: "Sarah Conner (Manager)",
    action: "REGULARIZATION_APPROVED",
    table_name: "attendance_days",
    record_id: "req-101",
    old_data: { status: "absent", total_minutes: 0 },
    new_data: { status: "present", total_minutes: 480 },
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: "log-2",
    actor_id: "adm-1",
    actor_name: "Alex Vance (HR Admin)",
    action: "LOCK_MONTH",
    table_name: "attendance_days",
    record_id: "month-2026-10",
    old_data: { locked: false },
    new_data: { locked: true, month: 10, year: 2026, records_locked: 48 },
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
];

export function AuditLogViewer({
  logs = mockAuditLogs,
  className,
}: {
  logs?: AuditLogItem[];
  className?: string;
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <BentoCard
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-purple" />
          <span>System Audit Logs</span>
        </div>
      }
      subtitle="Immutable security trail of administrative overrides and approvals"
      className={cn("p-6", className)}
    >
      <div className="space-y-3">
        {logs.map((log) => {
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-card-subtle border border-border-light text-xs transition-all"
            >
              <div
                onClick={() => toggleExpand(log.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-purple-light text-brand-purple uppercase">
                      {log.action}
                    </span>
                    <span className="font-bold text-text-primary">
                      {log.table_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Actor:{" "}
                    <span className="font-semibold text-text-secondary">
                      {log.actor_name || log.actor_id || "System Worker"}
                    </span>{" "}
                    •{" "}
                    {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                  </p>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-full text-text-tertiary hover:text-text-primary"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Expandable State Diff */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-card border border-border-light">
                    <span className="text-status-danger-text font-bold block mb-1">
                      - Previous State (old_data):
                    </span>
                    <pre className="text-text-tertiary overflow-x-auto">
                      {JSON.stringify(log.old_data, null, 2)}
                    </pre>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border-light">
                    <span className="text-status-success-text font-bold block mb-1">
                      + New State (new_data):
                    </span>
                    <pre className="text-text-primary overflow-x-auto">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
}


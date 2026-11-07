"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { RequestCard } from "@/features/requests/components/request-card";
import { RequestModal } from "@/features/requests/components/request-modal";
import {
  useRegularizations,
  useSubmitRegularization,
  useApproveRegularization,
  useRejectRegularization,
} from "@/features/requests/hooks/use-regularizations";
import { RegularizationStatus } from "@/types/database.types";
import { Plus, Filter, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const { data: requests, isLoading, refetch } = useRegularizations();
  const submitMutation = useSubmitRegularization();
  const approveMutation = useApproveRegularization();
  const rejectMutation = useRejectRegularization();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | RegularizationStatus
  >("all");

  const filteredRequests = (requests || []).filter((req) => {
    if (statusFilter === "all") return true;
    return req.status === statusFilter;
  });

  const pendingCount = (requests || []).filter((r) => r.status === "pending").length;

  return (
    <AppShell
      primaryActionLabel="New Request"
      onPrimaryAction={() => setModalOpen(true)}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Attendance Regularization
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Submit adjustments for missed punches or connectivity drops, and review status.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-full bg-card border border-border-light text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors shadow-sm cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw className="w-4 h-4 text-brand-purple" />
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply Correction</span>
            </button>
          </div>
        </section>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-border-light/60 pb-3">
          <Filter className="w-3.5 h-3.5 text-text-tertiary mr-1" />
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer",
                  isActive
                    ? "bg-brand-purple text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary bg-card-subtle hover:bg-card border border-border-light"
                )}
              >
                {tab}
                {tab === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-status-warning-dot text-brand-navy font-extrabold">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Requests List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-card border border-border-light animate-pulse p-5"
              />
            ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                canReview={true} // Enabled for direct testing/demo
                onApprove={(id) =>
                  approveMutation.mutate({
                    requestId: id,
                    reviewNote: "Approved via dashboard",
                  })
                }
                onReject={(id) =>
                  rejectMutation.mutate({
                    requestId: id,
                    reviewNote: "Declined per policy guidelines",
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-3xl bg-card border border-border-light shadow-sm flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 rounded-full bg-brand-purple-light flex items-center justify-center text-brand-purple mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">
              No regularization requests found
            </h3>
            <p className="text-xs text-text-tertiary mt-1 max-w-sm">
              All your punches are in order. If you ever miss an entry, click "Apply Correction" above.
            </p>
          </div>
        )}

        {/* New Request Modal */}
        <RequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmitRequest={async (data) => {
            await submitMutation.mutateAsync(data);
          }}
        />
      </div>
    </AppShell>
  );
}


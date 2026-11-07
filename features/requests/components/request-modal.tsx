"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  regularizationFormSchema,
  RegularizationFormData,
} from "@/features/requests/types";
import { X, Calendar, Clock, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitRequest: (data: RegularizationFormData) => Promise<void>;
  initialDate?: string;
}

export function RequestModal({
  open,
  onOpenChange,
  onSubmitRequest,
  initialDate,
}: RequestModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegularizationFormData>({
    resolver: zodResolver(regularizationFormSchema),
    defaultValues: {
      workDate: initialDate || new Date().toISOString().split("T")[0],
      requestedInTime: "09:00",
      requestedOutTime: "17:30",
      reason: "",
    },
  });

  if (!open) return null;

  const handleFormSubmit = async (values: RegularizationFormData) => {
    try {
      await onSubmitRequest(values);
      toast.success("Regularization request submitted!", {
        description: "Sent to your reporting manager for review.",
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="w-full max-w-lg bg-card rounded-[32px] shadow-shell border border-border-light p-6 sm:p-8 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-light mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-purple flex items-center justify-center text-white shadow-float">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-base font-extrabold text-text-primary tracking-tight"
              >
                Request Attendance Correction
              </h3>
              <p className="text-xs text-text-secondary">
                Submit missed punch or time regularization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
              Work Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                {...register("workDate")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card-subtle border border-border-light text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
              />
            </div>
            {errors.workDate && (
              <p className="text-[11px] text-status-danger-text mt-1 font-semibold">
                {errors.workDate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                Requested In
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  {...register("requestedInTime")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-card-subtle border border-border-light text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
                />
              </div>
              {errors.requestedInTime && (
                <p className="text-[11px] text-status-danger-text mt-1 font-semibold">
                  {errors.requestedInTime.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                Requested Out
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  {...register("requestedOutTime")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-card-subtle border border-border-light text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
                />
              </div>
              {errors.requestedOutTime && (
                <p className="text-[11px] text-status-danger-text mt-1 font-semibold">
                  {errors.requestedOutTime.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
              Reason / Justification
            </label>
            <textarea
              rows={3}
              {...register("reason")}
              placeholder="e.g. Wi-Fi disconnection during evening shift, doctor appointment in morning..."
              className="w-full p-3.5 rounded-xl bg-card-subtle border border-border-light text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none"
            />
            {errors.reason && (
              <p className="text-[11px] text-status-danger-text mt-1 font-semibold">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-card-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit for Approval"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


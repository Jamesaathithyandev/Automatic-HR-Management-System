"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  RegularizationRequestItem,
  RegularizationFormData,
} from "@/features/requests/types";
import { toast } from "sonner";

export function useRegularizations() {
  const supabase = createClient();

  return useQuery<RegularizationRequestItem[]>({
    queryKey: ["regularizations"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? (await supabase.auth.getUser()).data.user;

      if (!user) {
        // Fallback demo requests
        return [
          {
            id: "demo-req-1",
            employee_id: "demo-emp",
            employee_name: "James Aathithyan",
            work_date: "2026-11-05",
            requested_in: "2026-11-05T09:00:00Z",
            requested_out: "2026-11-05T17:30:00Z",
            reason: "Wi-Fi connectivity outage during evening checkout.",
            status: "pending",
            reviewed_by: null,
            reviewed_at: null,
            review_note: null,
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-req-2",
            employee_id: "demo-emp",
            employee_name: "James Aathithyan",
            work_date: "2026-10-28",
            requested_in: "2026-10-28T09:30:00Z",
            requested_out: "2026-10-28T18:00:00Z",
            reason: "Delayed check-in due to scheduled doctor appointment.",
            status: "approved",
            reviewed_by: "mgr-1",
            reviewed_at: "2026-10-29T10:00:00Z",
            review_note: "Approved by Engineering Lead",
            created_at: "2026-10-28T18:30:00Z",
          },
        ];
      }

      const { data, error } = await supabase
        .from("regularization_requests")
        .select(`
          *,
          employees:employee_id (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        employee_id: row.employee_id,
        employee_name: row.employees?.full_name || undefined,
        work_date: row.work_date,
        requested_in: row.requested_in,
        requested_out: row.requested_out,
        reason: row.reason,
        status: row.status,
        reviewed_by: row.reviewed_by,
        reviewed_at: row.reviewed_at,
        review_note: row.review_note,
        created_at: row.created_at,
      }));
    },
  });
}

export function useSubmitRegularization() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (formData: RegularizationFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? (await supabase.auth.getUser()).data.user;

      const requestedInIso = `${formData.workDate}T${formData.requestedInTime}:00Z`;
      const requestedOutIso = `${formData.workDate}T${formData.requestedOutTime}:00Z`;

      if (!user) {
        // Optimistic demo support
        return { success: true };
      }

      const { data, error } = await (supabase.from("regularization_requests") as any)
        .insert({
          employee_id: user.id,
          work_date: formData.workDate,
          requested_in: requestedInIso,
          requested_out: requestedOutIso,
          reason: formData.reason,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regularizations"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useApproveRegularization() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      reviewNote,
    }: {
      requestId: string;
      reviewNote?: string;
    }) => {
      const { data, error } = await (supabase.rpc as any)(
        "approve_regularization",
        {
          p_request_id: requestId,
          p_review_note: reviewNote || undefined,
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Request approved! Attendance day has been recalculated.");
      queryClient.invalidateQueries({ queryKey: ["regularizations"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve request");
    },
  });
}

export function useRejectRegularization() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      reviewNote,
    }: {
      requestId: string;
      reviewNote?: string;
    }) => {
      const { data, error } = await (supabase.rpc as any)(
        "reject_regularization",
        {
          p_request_id: requestId,
          p_review_note: reviewNote || undefined,
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.info("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["regularizations"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject request");
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDurationMinutes } from "@/lib/date/timezone";

export function useCheckOut() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase.rpc as any)("check_out");

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data: any) => {
      const duration = formatDurationMinutes(data?.duration_minutes || 0);
      toast.info("Checked out successfully!", {
        description: `Session closed. Logged ${duration} for ${data?.work_date}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to check out");
    },
  });
}

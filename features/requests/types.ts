import { z } from "zod";
import { RegularizationStatus } from "@/types/database.types";

export const regularizationFormSchema = z
  .object({
    workDate: z.string().min(10, "Valid date (YYYY-MM-DD) is required"),
    requestedInTime: z.string().min(4, "Check-in time is required (e.g. 09:00)"),
    requestedOutTime: z.string().min(4, "Check-out time is required (e.g. 17:30)"),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters long")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine(
    (data) => {
      return data.requestedInTime < data.requestedOutTime;
    },
    {
      message: "Check-out time must be later than check-in time",
      path: ["requestedOutTime"],
    }
  );

export type RegularizationFormData = z.infer<typeof regularizationFormSchema>;

export interface RegularizationRequestItem {
  id: string;
  employee_id: string;
  employee_name?: string;
  work_date: string;
  requested_in: string;
  requested_out: string;
  reason: string;
  status: RegularizationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}


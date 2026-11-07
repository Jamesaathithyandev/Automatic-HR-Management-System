"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getEmployeeWorkDate } from "@/lib/date/timezone";
import { AttendanceDayStatus, SessionSource } from "@/types/database.types";

export interface AttendanceSessionItem {
  id: string;
  employee_id: string;
  work_date: string;
  check_in_at: string;
  check_out_at: string | null;
  source: SessionSource;
  note: string | null;
}

export interface DaySummaryRow {
  total_minutes: number;
  status: AttendanceDayStatus;
  is_late: boolean;
  locked: boolean;
}

export interface TodayAttendanceData {
  workDate: string;
  timezone: string;
  targetMinutes: number;
  activeSession: AttendanceSessionItem | null;
  sessions: AttendanceSessionItem[];
  daySummary: DaySummaryRow | null;
  weekTotalMinutes: number;
  streakDays: number;
}

interface EmployeeProfileRow {
  timezone: string;
  work_target_minutes: number;
}

export function useAttendanceToday() {
  const supabase = createClient();

  return useQuery<TodayAttendanceData>({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? (await supabase.auth.getUser()).data.user;

      const userTimezone =
        (user?.user_metadata?.timezone as string) || "UTC";
      const todayDate = getEmployeeWorkDate(userTimezone);

      // If no authenticated user session (e.g. previewing locally)
      if (!user) {
        return {
          workDate: todayDate,
          timezone: userTimezone,
          targetMinutes: 480,
          activeSession: null,
          sessions: [
            {
              id: "mock-sess-1",
              employee_id: "demo",
              work_date: todayDate,
              check_in_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
              check_out_at: new Date(Date.now() - 3600 * 1000).toISOString(),
              source: "web",
              note: "Core morning shift",
            },
          ],
          daySummary: {
            total_minutes: 180,
            status: "present",
            is_late: false,
            locked: false,
          },
          weekTotalMinutes: 2190, // ~36.5h
          streakDays: 14,
        };
      }

      // Fetch employee profile
      const { data: profileData } = await supabase
        .from("employees")
        .select("timezone, work_target_minutes")
        .eq("id", user.id)
        .maybeSingle();

      const empProfile = profileData as EmployeeProfileRow | null;
      const effectiveTz = empProfile?.timezone || userTimezone;
      const effectiveWorkDate = getEmployeeWorkDate(effectiveTz);
      const targetMins = empProfile?.work_target_minutes || 480;

      // 1. Fetch today's sessions
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("employee_id", user.id)
        .eq("work_date", effectiveWorkDate)
        .order("check_in_at", { ascending: true });

      const sessionList = (sessions || []) as AttendanceSessionItem[];
      const active = sessionList.find((s) => s.check_out_at === null) || null;

      // 2. Fetch today's day summary
      const { data: summaryData } = await supabase
        .from("attendance_days")
        .select("total_minutes, status, is_late, locked")
        .eq("employee_id", user.id)
        .eq("work_date", effectiveWorkDate)
        .maybeSingle();

      const daySummary = summaryData as DaySummaryRow | null;

      // 3. Fetch past 7 days for week total
      const { data: weekDays } = await supabase
        .from("attendance_days")
        .select("total_minutes")
        .eq("employee_id", user.id)
        .order("work_date", { ascending: false })
        .limit(7);

      const weekRows = (weekDays || []) as { total_minutes: number }[];
      const weekTotal = weekRows.reduce(
        (acc, curr) => acc + (curr.total_minutes || 0),
        0
      );

      return {
        workDate: effectiveWorkDate,
        timezone: effectiveTz,
        targetMinutes: targetMins,
        activeSession: active,
        sessions: sessionList,
        daySummary: daySummary || null,
        weekTotalMinutes: weekTotal || (daySummary?.total_minutes || 0),
        streakDays: 14,
      };
    },
  });
}

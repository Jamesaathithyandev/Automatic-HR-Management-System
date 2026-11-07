export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EmployeeRole = "employee" | "manager" | "hr" | "admin";
export type SessionSource = "web" | "auto" | "manual";
export type AttendanceDayStatus =
  | "present"
  | "half_day"
  | "absent"
  | "holiday"
  | "weekend"
  | "leave";
export type RegularizationStatus = "pending" | "approved" | "rejected";
export type NotificationType =
  | "missed_checkout"
  | "request_status"
  | "policy_update"
  | "reminder";

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          manager_id: string | null;
          timezone: string;
          work_target_minutes: number;
          status: "active" | "inactive" | "on_leave" | "probation" | "exited";
          joined_on: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          manager_id?: string | null;
          timezone?: string;
          work_target_minutes?: number;
          status?: "active" | "inactive" | "on_leave" | "probation" | "exited";
          joined_on?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          manager_id?: string | null;
          timezone?: string;
          work_target_minutes?: number;
          status?: "active" | "inactive" | "on_leave" | "probation" | "exited";
          joined_on?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          user_id: string;
          role: EmployeeRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: EmployeeRole;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: EmployeeRole;
          created_at?: string;
        };
      };
      attendance_policies: {
        Row: {
          id: string;
          grace_minutes: number;
          half_day_minutes: number;
          absent_minutes: number;
          auto_checkout_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grace_minutes?: number;
          half_day_minutes?: number;
          absent_minutes?: number;
          auto_checkout_time?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grace_minutes?: number;
          half_day_minutes?: number;
          absent_minutes?: number;
          auto_checkout_time?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_sessions: {
        Row: {
          id: string;
          employee_id: string;
          work_date: string;
          check_in_at: string;
          check_out_at: string | null;
          source: SessionSource;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          work_date: string;
          check_in_at: string;
          check_out_at?: string | null;
          source?: SessionSource;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          work_date?: string;
          check_in_at?: string;
          check_out_at?: string | null;
          source?: SessionSource;
          note?: string | null;
          created_at?: string;
        };
      };
      attendance_days: {
        Row: {
          employee_id: string;
          work_date: string;
          total_minutes: number;
          status: AttendanceDayStatus;
          is_late: boolean;
          locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          employee_id: string;
          work_date: string;
          total_minutes?: number;
          status?: AttendanceDayStatus;
          is_late?: boolean;
          locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          employee_id?: string;
          work_date?: string;
          total_minutes?: number;
          status?: AttendanceDayStatus;
          is_late?: boolean;
          locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      regularization_requests: {
        Row: {
          id: string;
          employee_id: string;
          work_date: string;
          requested_in: string;
          requested_out: string;
          reason: string;
          status: RegularizationStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          work_date: string;
          requested_in: string;
          requested_out: string;
          reason: string;
          status?: RegularizationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          work_date?: string;
          requested_in?: string;
          requested_out?: string;
          reason?: string;
          status?: RegularizationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
      };
      holidays: {
        Row: {
          id: string;
          date: string;
          name: string;
          region: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          name: string;
          region?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          name?: string;
          region?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          table_name: string;
          record_id: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          table_name: string;
          record_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      check_in: {
        Args: { p_note?: string };
        Returns: { session_id: string; check_in_at: string };
      };
      check_out: {
        Args: Record<PropertyKey, never>;
        Returns: { session_id: string; check_out_at: string; duration_minutes: number };
      };
      recalculate_day: {
        Args: { p_employee_id: string; p_work_date: string };
        Returns: void;
      };
      approve_regularization: {
        Args: { p_request_id: string; p_review_note?: string };
        Returns: { success: boolean };
      };
      reject_regularization: {
        Args: { p_request_id: string; p_review_note?: string };
        Returns: { success: boolean };
      };
      lock_month: {
        Args: { p_year: number; p_month: number };
        Returns: { locked_records: number };
      };
    };
  };
}


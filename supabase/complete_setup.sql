-- COMPLETE SETUP SCRIPT (WITH TAMIL NADU CALENDAR)

-- SOURCE: supabase/migrations/20261107000001_initial_schema.sql
-- Migration: 20261107000001_initial_schema.sql
-- Description: Core tables, indexes, constraints, and audit log system for Attendance Module

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    work_target_minutes INTEGER NOT NULL DEFAULT 480, -- 8 hours standard
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'probation', 'exited')),
    joined_on DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Roles Table (Separated from user metadata for strict security)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('employee', 'manager', 'hr', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role)
);

-- 3. Attendance Policies
CREATE TABLE IF NOT EXISTS public.attendance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grace_minutes INTEGER NOT NULL DEFAULT 15,
    half_day_minutes INTEGER NOT NULL DEFAULT 240, -- 4 hours
    absent_minutes INTEGER NOT NULL DEFAULT 120,   -- less than 2 hours
    auto_checkout_time TIME NOT NULL DEFAULT '23:59:00',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Attendance Sessions (Raw check-in and check-out intervals)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    check_in_at TIMESTAMPTZ NOT NULL,
    check_out_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'auto', 'manual')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crucial: Partial unique index allowing only ONE active/open session per employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_open_session 
ON public.attendance_sessions (employee_id) 
WHERE check_out_at IS NULL;

-- 5. Attendance Days (Consolidated daily summary)
CREATE TABLE IF NOT EXISTS public.attendance_days (
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'half_day', 'absent', 'holiday', 'weekend', 'leave')),
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (employee_id, work_date)
);

-- 6. Regularization Requests
CREATE TABLE IF NOT EXISTS public.regularization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    requested_in TIMESTAMPTZ NOT NULL,
    requested_out TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('missed_checkout', 'request_status', 'policy_update', 'reminder')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Holidays
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'GLOBAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes (Optimized for composite filters & RLS lookups)
CREATE INDEX IF NOT EXISTS idx_employees_manager ON public.employees (manager_id);
CREATE INDEX IF NOT EXISTS idx_sessions_emp_date ON public.attendance_sessions (employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_days_emp_date ON public.attendance_days (employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_days_locked ON public.attendance_days (locked) WHERE locked = FALSE;
CREATE INDEX IF NOT EXISTS idx_requests_emp_date ON public.regularization_requests (employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.regularization_requests (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);



-- SOURCE: supabase/migrations/20261107000002_custom_access_token_hook.sql
-- Migration: 20261107000002_custom_access_token_hook.sql
-- Description: Custom Access Token Hook to inject user_role into JWT claims

-- Helper function to fetch the role of a user
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
$$;

-- Supabase Custom Access Token Hook
-- Supabase Auth executes this function before minting the JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims JSONB;
    user_role TEXT;
    target_user_id UUID;
BEGIN
    target_user_id := (event->>'user_id')::UUID;
    
    -- Lookup the assigned role from user_roles table
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = target_user_id 
    LIMIT 1;

    -- Default to 'employee' if no explicit role has been assigned
    IF user_role IS NULL THEN
        user_role := 'employee';
    END IF;

    claims := event->'claims';
    -- Inject user_role into claims
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    
    -- Reassign claims to event payload
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;

-- Permissions for the auth hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) FROM authenticated, anon, public;



-- SOURCE: supabase/migrations/20261107000003_rls_policies.sql
-- Migration: 20261107000003_rls_policies.sql
-- Description: Strict deny-by-default Row Level Security policies with (select auth.uid()) subqueries

-- Fast helper function to resolve current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claim.user_role', true), ''),
        (SELECT role FROM public.user_roles WHERE user_id = (SELECT auth.uid()) LIMIT 1),
        'employee'
    );
$$;

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regularization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- 1. EMPLOYEES TABLE POLICIES
---------------------------------------------------------
-- SELECT: Employee reads own, Manager reads own + direct reports, HR/Admin read all
CREATE POLICY "employees_select_policy"
ON public.employees
FOR SELECT
TO authenticated
USING (
    id = (SELECT auth.uid())
    OR manager_id = (SELECT auth.uid())
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- UPDATE: HR/Admin can update all fields; Employee can update own timezone
CREATE POLICY "employees_update_policy"
ON public.employees
FOR UPDATE
TO authenticated
USING (
    id = (SELECT auth.uid())
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
)
WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- INSERT: HR / Admin only
CREATE POLICY "employees_insert_policy"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- DELETE: Admin only
CREATE POLICY "employees_delete_policy"
ON public.employees
FOR DELETE
TO authenticated
USING (
    (SELECT public.current_user_role()) = 'admin'
);

---------------------------------------------------------
-- 2. USER ROLES POLICIES
---------------------------------------------------------
-- SELECT: User reads own role, HR/Admin read all
CREATE POLICY "user_roles_select_policy"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- INSERT/UPDATE/DELETE: Admin only
CREATE POLICY "user_roles_admin_manage_policy"
ON public.user_roles
FOR ALL
TO authenticated
USING (
    (SELECT public.current_user_role()) = 'admin'
)
WITH CHECK (
    (SELECT public.current_user_role()) = 'admin'
);

---------------------------------------------------------
-- 3. ATTENDANCE SESSIONS POLICIES
---------------------------------------------------------
-- SELECT: Employee reads own, Manager reads own + reports, HR/Admin read all
CREATE POLICY "attendance_sessions_select_policy"
ON public.attendance_sessions
FOR SELECT
TO authenticated
USING (
    employee_id = (SELECT auth.uid())
    OR employee_id IN (SELECT id FROM public.employees WHERE manager_id = (SELECT auth.uid()))
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- Direct client INSERT/UPDATE/DELETE are strictly DENIED
-- All session modifications MUST pass through RPC functions (check_in, check_out, approve_regularization)
-- HR/Admin retain emergency override privileges
CREATE POLICY "attendance_sessions_admin_override"
ON public.attendance_sessions
FOR ALL
TO authenticated
USING (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
)
WITH CHECK (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
);

---------------------------------------------------------
-- 4. ATTENDANCE DAYS POLICIES
---------------------------------------------------------
-- SELECT: Employee reads own, Manager reads own + reports, HR/Admin read all
CREATE POLICY "attendance_days_select_policy"
ON public.attendance_days
FOR SELECT
TO authenticated
USING (
    employee_id = (SELECT auth.uid())
    OR employee_id IN (SELECT id FROM public.employees WHERE manager_id = (SELECT auth.uid()))
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- Direct client mutations DENIED; recalculate_day() handles updates with SECURITY DEFINER
CREATE POLICY "attendance_days_admin_override"
ON public.attendance_days
FOR ALL
TO authenticated
USING (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
)
WITH CHECK (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
);

---------------------------------------------------------
-- 5. REGULARIZATION REQUESTS POLICIES
---------------------------------------------------------
-- SELECT: Employee reads own, Manager reads direct reports + own, HR/Admin read all
CREATE POLICY "regularization_requests_select_policy"
ON public.regularization_requests
FOR SELECT
TO authenticated
USING (
    employee_id = (SELECT auth.uid())
    OR employee_id IN (SELECT id FROM public.employees WHERE manager_id = (SELECT auth.uid()))
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- INSERT: Employee can insert their own request with status 'pending'
CREATE POLICY "regularization_requests_insert_policy"
ON public.regularization_requests
FOR INSERT
TO authenticated
WITH CHECK (
    employee_id = (SELECT auth.uid())
    AND status = 'pending'
);

-- UPDATE: Manager can review requests from direct reports; HR/Admin can review all
CREATE POLICY "regularization_requests_review_policy"
ON public.regularization_requests
FOR UPDATE
TO authenticated
USING (
    employee_id IN (SELECT id FROM public.employees WHERE manager_id = (SELECT auth.uid()))
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
)
WITH CHECK (
    employee_id IN (SELECT id FROM public.employees WHERE manager_id = (SELECT auth.uid()))
    OR (SELECT public.current_user_role()) IN ('hr', 'admin')
);

---------------------------------------------------------
-- 6. NOTIFICATIONS POLICIES
---------------------------------------------------------
-- SELECT: Users read only their own notifications
CREATE POLICY "notifications_select_policy"
ON public.notifications
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);

-- UPDATE: Users can mark their own notifications as read
CREATE POLICY "notifications_update_policy"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
)
WITH CHECK (
    user_id = (SELECT auth.uid())
);

---------------------------------------------------------
-- 7. HOLIDAYS POLICIES
---------------------------------------------------------
-- SELECT: All authenticated employees can view holidays
CREATE POLICY "holidays_select_policy"
ON public.holidays
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) IS NOT NULL
);

-- INSERT/UPDATE/DELETE: HR / Admin only
CREATE POLICY "holidays_admin_manage_policy"
ON public.holidays
FOR ALL
TO authenticated
USING (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
)
WITH CHECK (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
);

---------------------------------------------------------
-- 8. ATTENDANCE POLICIES
---------------------------------------------------------
-- SELECT: All authenticated users can view active policies
CREATE POLICY "attendance_policies_select_policy"
ON public.attendance_policies
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) IS NOT NULL
);

-- INSERT/UPDATE/DELETE: HR / Admin only
CREATE POLICY "attendance_policies_admin_policy"
ON public.attendance_policies
FOR ALL
TO authenticated
USING (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
)
WITH CHECK (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
);

---------------------------------------------------------
-- 9. AUDIT LOGS POLICIES
---------------------------------------------------------
-- SELECT: HR and Admin only
CREATE POLICY "audit_logs_select_policy"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
    (SELECT public.current_user_role()) IN ('hr', 'admin')
);

-- Direct client mutations strictly DENIED; system triggers insert audit records



-- SOURCE: supabase/migrations/20261107000004_attendance_rpcs.sql
-- Migration: 20261107000004_attendance_rpcs.sql
-- Description: Core Attendance Stored Procedures (check_in, check_out, recalculate_day, lock_month)

---------------------------------------------------------
-- 1. RECALCULATE DAY FUNCTION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_day(
    p_employee_id UUID,
    p_work_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_locked BOOLEAN := FALSE;
    v_total_minutes INTEGER := 0;
    v_status TEXT := 'absent';
    v_is_late BOOLEAN := FALSE;
    v_emp_tz TEXT := 'UTC';
    v_is_holiday BOOLEAN := FALSE;
    v_is_weekend BOOLEAN := FALSE;
    v_grace_minutes INTEGER := 15;
    v_half_day_minutes INTEGER := 240;
    v_full_day_target INTEGER := 480;
    v_earliest_in TIMESTAMPTZ;
    v_expected_start TIME := '09:00:00';
    v_actual_start_time TIME;
BEGIN
    -- Check if day is already locked
    SELECT locked INTO v_is_locked
    FROM public.attendance_days
    WHERE employee_id = p_employee_id AND work_date = p_work_date;

    IF v_is_locked = TRUE THEN
        -- Locked records cannot be modified
        RETURN;
    END IF;

    -- Fetch employee timezone and work target
    SELECT timezone, work_target_minutes INTO v_emp_tz, v_full_day_target
    FROM public.employees
    WHERE id = p_employee_id;

    IF v_emp_tz IS NULL THEN
        v_emp_tz := 'UTC';
    END IF;

    IF v_full_day_target IS NULL THEN
        v_full_day_target := 480;
    END IF;

    -- Fetch active policy configurations
    SELECT grace_minutes, half_day_minutes
    INTO v_grace_minutes, v_half_day_minutes
    FROM public.attendance_policies
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_grace_minutes IS NULL THEN
        v_grace_minutes := 15;
    END IF;
    IF v_half_day_minutes IS NULL THEN
        v_half_day_minutes := 240;
    END IF;

    -- Check if date is a scheduled public holiday
    IF EXISTS (SELECT 1 FROM public.holidays WHERE date = p_work_date) THEN
        v_is_holiday := TRUE;
    END IF;

    -- Check if date falls on weekend (ISO DOW: 6 = Saturday, 7 = Sunday)
    IF EXTRACT(ISODOW FROM p_work_date) IN (6, 7) THEN
        v_is_weekend := TRUE;
    END IF;

    -- Aggregate total minutes from closed sessions
    SELECT 
        COALESCE(SUM(ROUND(EXTRACT(EPOCH FROM (check_out_at - check_in_at)) / 60.0)), 0)::INTEGER,
        MIN(check_in_at)
    INTO v_total_minutes, v_earliest_in
    FROM public.attendance_sessions
    WHERE employee_id = p_employee_id 
      AND work_date = p_work_date
      AND check_out_at IS NOT NULL;

    -- Evaluate Late Arrival
    IF v_earliest_in IS NOT NULL THEN
        -- Convert earliest check in timestamp to employee local time
        v_actual_start_time := (v_earliest_in AT TIME ZONE v_emp_tz)::TIME;
        IF v_actual_start_time > (v_expected_start + (v_grace_minutes || ' minutes')::INTERVAL) THEN
            v_is_late := TRUE;
        END IF;
    END IF;

    -- Categorize day status based on minutes and company policies
    IF v_total_minutes >= (v_full_day_target - v_grace_minutes) THEN
        v_status := 'present';
    ELSIF v_total_minutes >= v_half_day_minutes THEN
        v_status := 'half_day';
    ELSIF v_is_holiday THEN
        v_status := 'holiday';
    ELSIF v_is_weekend THEN
        v_status := 'weekend';
    ELSE
        -- Check if employee has an open ongoing session today
        IF EXISTS (
            SELECT 1 FROM public.attendance_sessions
            WHERE employee_id = p_employee_id 
              AND work_date = p_work_date
              AND check_out_at IS NULL
        ) THEN
            v_status := 'present';
        ELSE
            v_status := 'absent';
        END IF;
    END IF;

    -- Upsert consolidated daily summary
    INSERT INTO public.attendance_days (
        employee_id,
        work_date,
        total_minutes,
        status,
        is_late,
        locked,
        updated_at
    )
    VALUES (
        p_employee_id,
        p_work_date,
        v_total_minutes,
        v_status,
        v_is_late,
        FALSE,
        NOW()
    )
    ON CONFLICT (employee_id, work_date)
    DO UPDATE SET
        total_minutes = EXCLUDED.total_minutes,
        status = EXCLUDED.status,
        is_late = EXCLUDED.is_late,
        updated_at = NOW();

END;
$$;

---------------------------------------------------------
-- 2. CHECK IN RPC FUNCTION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_in(
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_emp_tz TEXT := 'UTC';
    v_work_date DATE;
    v_server_now TIMESTAMPTZ := NOW();
    v_session_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Fetch employee timezone to calculate correct work_date
    SELECT timezone INTO v_emp_tz
    FROM public.employees
    WHERE id = v_user_id;

    IF v_emp_tz IS NULL THEN
        v_emp_tz := 'UTC';
    END IF;

    -- Server authoritative work_date in employee local time
    v_work_date := (v_server_now AT TIME ZONE v_emp_tz)::DATE;

    -- Check if an active open session already exists
    IF EXISTS (
        SELECT 1 FROM public.attendance_sessions
        WHERE employee_id = v_user_id AND check_out_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Active session already exists. Please check out first.';
    END IF;

    -- Insert new session
    INSERT INTO public.attendance_sessions (
        employee_id,
        work_date,
        check_in_at,
        source,
        note
    )
    VALUES (
        v_user_id,
        v_work_date,
        v_server_now,
        'web',
        p_note
    )
    RETURNING id INTO v_session_id;

    -- Trigger day recalculation
    PERFORM public.recalculate_day(v_user_id, v_work_date);

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'check_in_at', v_server_now,
        'work_date', v_work_date
    );
END;
$$;

---------------------------------------------------------
-- 3. CHECK OUT RPC FUNCTION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_out()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_check_in_at TIMESTAMPTZ;
    v_server_now TIMESTAMPTZ := NOW();
    v_final_check_out TIMESTAMPTZ;
    v_work_date DATE;
    v_duration_minutes INTEGER;
    v_max_duration INTERVAL := INTERVAL '16 hours';
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Locate active open session
    SELECT id, check_in_at, work_date
    INTO v_session_id, v_check_in_at, v_work_date
    FROM public.attendance_sessions
    WHERE employee_id = v_user_id AND check_out_at IS NULL
    FOR UPDATE;

    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'No active session found to check out.';
    END IF;

    -- Cap maximum continuous session length at 16 hours
    IF (v_server_now - v_check_in_at) > v_max_duration THEN
        v_final_check_out := v_check_in_at + v_max_duration;
    ELSE
        v_final_check_out := v_server_now;
    END IF;

    -- Calculate duration minutes
    v_duration_minutes := ROUND(EXTRACT(EPOCH FROM (v_final_check_out - v_check_in_at)) / 60.0)::INTEGER;

    -- Update session
    UPDATE public.attendance_sessions
    SET check_out_at = v_final_check_out
    WHERE id = v_session_id;

    -- Trigger day recalculation
    PERFORM public.recalculate_day(v_user_id, v_work_date);

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'check_out_at', v_final_check_out,
        'duration_minutes', v_duration_minutes,
        'work_date', v_work_date
    );
END;
$$;

---------------------------------------------------------
-- 4. LOCK MONTH FUNCTION (HR / Admin Only)
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lock_month(
    p_year INTEGER,
    p_month INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_count INTEGER := 0;
BEGIN
    v_role := public.current_user_role();
    IF v_role NOT IN ('hr', 'admin') THEN
        RAISE EXCEPTION 'Access denied. HR or Admin role required.';
    END IF;

    -- Lock all attendance days for specified month
    UPDATE public.attendance_days
    SET locked = TRUE, updated_at = NOW()
    WHERE EXTRACT(YEAR FROM work_date) = p_year
      AND EXTRACT(MONTH FROM work_date) = p_month
      AND locked = FALSE;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Audit log entry
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        table_name,
        record_id,
        new_data
    )
    VALUES (
        auth.uid(),
        'LOCK_MONTH',
        'attendance_days',
        gen_random_uuid(),
        jsonb_build_object('year', p_year, 'month', p_month, 'records_locked', v_count)
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'records_locked', v_count,
        'year', p_year,
        'month', p_month
    );
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.check_in(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_out() TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_day(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lock_month(INTEGER, INTEGER) TO authenticated;


-- SOURCE: supabase/migrations/20261107000005_regularization_rpcs.sql
-- Migration: 20261107000005_regularization_rpcs.sql
-- Description: Regularization approval and rejection workflows with audit logging

---------------------------------------------------------
-- 1. APPROVE REGULARIZATION RPC FUNCTION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_regularization(
    p_request_id UUID,
    p_review_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id UUID;
    v_actor_role TEXT;
    v_req RECORD;
    v_emp RECORD;
    v_old_day RECORD;
    v_new_day RECORD;
BEGIN
    v_actor_id := auth.uid();
    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_actor_role := public.current_user_role();

    -- Lock the regularization request row
    SELECT * INTO v_req
    FROM public.regularization_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF v_req.id IS NULL THEN
        RAISE EXCEPTION 'Regularization request not found';
    END IF;

    IF v_req.status != 'pending' THEN
        RAISE EXCEPTION 'Request has already been %', v_req.status;
    END IF;

    -- Fetch employee information
    SELECT id, manager_id, full_name, email INTO v_emp
    FROM public.employees
    WHERE id = v_req.employee_id;

    -- Verify Authorization: Direct Manager or HR / Admin
    IF v_actor_role NOT IN ('hr', 'admin') AND (v_emp.manager_id IS NULL OR v_emp.manager_id != v_actor_id) THEN
        RAISE EXCEPTION 'Access denied. Only the direct reporting manager or HR/Admin can approve this request.';
    END IF;

    -- Capture previous day summary for audit log
    SELECT * INTO v_old_day
    FROM public.attendance_days
    WHERE employee_id = v_req.employee_id AND work_date = v_req.work_date;

    -- Insert or update the manual attendance session
    INSERT INTO public.attendance_sessions (
        employee_id,
        work_date,
        check_in_at,
        check_out_at,
        source,
        note
    )
    VALUES (
        v_req.employee_id,
        v_req.work_date,
        v_req.requested_in,
        v_req.requested_out,
        'manual',
        'Regularization: ' || v_req.reason
    );

    -- Update request status
    UPDATE public.regularization_requests
    SET status = 'approved',
        reviewed_by = v_actor_id,
        reviewed_at = NOW(),
        review_note = p_review_note
    WHERE id = p_request_id;

    -- Recalculate attendance day
    PERFORM public.recalculate_day(v_req.employee_id, v_req.work_date);

    -- Capture new day summary for audit log
    SELECT * INTO v_new_day
    FROM public.attendance_days
    WHERE employee_id = v_req.employee_id AND work_date = v_req.work_date;

    -- Record Audit Log entry
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    )
    VALUES (
        v_actor_id,
        'REGULARIZATION_APPROVED',
        'attendance_days',
        p_request_id,
        row_to_json(v_old_day)::jsonb,
        row_to_json(v_new_day)::jsonb
    );

    -- Dispatch in-app notification to employee
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body
    )
    VALUES (
        v_req.employee_id,
        'request_status',
        'Regularization Approved',
        'Your attendance request for ' || v_req.work_date || ' was approved.'
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 'approved',
        'request_id', p_request_id,
        'work_date', v_req.work_date
    );
END;
$$;

---------------------------------------------------------
-- 2. REJECT REGULARIZATION RPC FUNCTION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reject_regularization(
    p_request_id UUID,
    p_review_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id UUID;
    v_actor_role TEXT;
    v_req RECORD;
    v_emp RECORD;
BEGIN
    v_actor_id := auth.uid();
    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_actor_role := public.current_user_role();

    SELECT * INTO v_req
    FROM public.regularization_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF v_req.id IS NULL THEN
        RAISE EXCEPTION 'Regularization request not found';
    END IF;

    IF v_req.status != 'pending' THEN
        RAISE EXCEPTION 'Request has already been %', v_req.status;
    END IF;

    SELECT id, manager_id INTO v_emp
    FROM public.employees
    WHERE id = v_req.employee_id;

    IF v_actor_role NOT IN ('hr', 'admin') AND (v_emp.manager_id IS NULL OR v_emp.manager_id != v_actor_id) THEN
        RAISE EXCEPTION 'Access denied. Only the direct reporting manager or HR/Admin can reject this request.';
    END IF;

    -- Update request status
    UPDATE public.regularization_requests
    SET status = 'rejected',
        reviewed_by = v_actor_id,
        reviewed_at = NOW(),
        review_note = p_review_note
    WHERE id = p_request_id;

    -- Record Audit Log entry
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    )
    VALUES (
        v_actor_id,
        'REGULARIZATION_REJECTED',
        'regularization_requests',
        p_request_id,
        jsonb_build_object('status', 'pending'),
        jsonb_build_object('status', 'rejected', 'note', p_review_note)
    );

    -- Dispatch notification
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body
    )
    VALUES (
        v_req.employee_id,
        'request_status',
        'Regularization Declined',
        COALESCE(p_review_note, 'Your attendance request for ' || v_req.work_date || ' was not approved.')
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 'rejected',
        'request_id', p_request_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_regularization(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_regularization(UUID, TEXT) TO authenticated;



-- SOURCE: supabase/migrations/20261107000006_cron_jobs.sql
-- Migration: 20261107000006_cron_jobs.sql
-- Description: Automated Background Jobs for Auto-Checkout and Nightly Attendance Finalization

-- Enable pg_cron if available on the PostgreSQL instance
CREATE EXTENSION IF NOT EXISTS "pg_cron";

---------------------------------------------------------
-- 1. AUTO-CHECKOUT BACKGROUND PROCEDURE
---------------------------------------------------------
-- Closes sessions that remained open past 23:59 or 16 hours
CREATE OR REPLACE FUNCTION public.cron_auto_checkout()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_closed_count INTEGER := 0;
    v_rec RECORD;
    v_checkout_time TIMESTAMPTZ;
BEGIN
    FOR v_rec IN
        SELECT id, employee_id, work_date, check_in_at
        FROM public.attendance_sessions
        WHERE check_out_at IS NULL
          AND (NOW() - check_in_at) >= INTERVAL '12 hours'
    LOOP
        -- Cap check_out_at at 8 hours after check-in or midnight
        v_checkout_time := v_rec.check_in_at + INTERVAL '8 hours';
        IF v_checkout_time > NOW() THEN
            v_checkout_time := NOW();
        END IF;

        UPDATE public.attendance_sessions
        SET check_out_at = v_checkout_time,
            source = 'auto',
            note = COALESCE(note, '') || ' [System Auto-Checkout at Day End]'
        WHERE id = v_rec.id;

        -- Recalculate employee's day
        PERFORM public.recalculate_day(v_rec.employee_id, v_rec.work_date);

        -- Dispatch in-app warning notification
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            body
        )
        VALUES (
            v_rec.employee_id,
            'missed_checkout',
            'Missed Checkout Recorded',
            'Your session on ' || v_rec.work_date || ' was auto-closed. Please apply for regularization if adjustments are needed.'
        );

        v_closed_count := v_closed_count + 1;
    END LOOP;

    RETURN v_closed_count;
END;
$$;

---------------------------------------------------------
-- 2. NIGHTLY BATCH FINALIZE PROCEDURE
---------------------------------------------------------
-- Marks absent for active employees who did not record any punch on past workdays
CREATE OR REPLACE FUNCTION public.cron_nightly_finalize()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_yesterday DATE := CURRENT_DATE - 1;
    v_marked_count INTEGER := 0;
    v_emp RECORD;
    v_is_holiday BOOLEAN := FALSE;
    v_is_weekend BOOLEAN := FALSE;
BEGIN
    -- Check if yesterday was holiday or weekend
    IF EXISTS (SELECT 1 FROM public.holidays WHERE date = v_yesterday) THEN
        v_is_holiday := TRUE;
    END IF;

    IF EXTRACT(ISODOW FROM v_yesterday) IN (6, 7) THEN
        v_is_weekend := TRUE;
    END IF;

    -- Iterate active confirmed employees
    FOR v_emp IN
        SELECT id FROM public.employees WHERE status = 'active'
    LOOP
        -- Check if an attendance record exists for yesterday
        IF NOT EXISTS (
            SELECT 1 FROM public.attendance_days 
            WHERE employee_id = v_emp.id AND work_date = v_yesterday
        ) THEN
            INSERT INTO public.attendance_days (
                employee_id,
                work_date,
                total_minutes,
                status,
                is_late,
                locked
            )
            VALUES (
                v_emp.id,
                v_yesterday,
                0,
                CASE 
                    WHEN v_is_holiday THEN 'holiday'
                    WHEN v_is_weekend THEN 'weekend'
                    ELSE 'absent'
                END,
                FALSE,
                FALSE
            );
            v_marked_count := v_marked_count + 1;
        END IF;
    END LOOP;

    RETURN v_marked_count;
END;
$$;

-- Schedule jobs using pg_cron (if extension exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Run Auto-Checkout at 23:59 every night
        PERFORM cron.schedule(
            'nightly-auto-checkout',
            '59 23 * * *',
            'SELECT public.cron_auto_checkout();'
        );

        -- Run Finalize Batch at 01:00 AM every night
        PERFORM cron.schedule(
            'nightly-finalize-attendance',
            '0 1 * * *',
            'SELECT public.cron_nightly_finalize();'
        );
    END IF;
END $$;



-- SOURCE: supabase/seed.sql
-- Supabase Seed Script: Production-Grade Attendance Management Module
-- Remote Startup HR System
-- Provides realistic seed data for development, testing, and live demos.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. AUTH USERS & IDENTITIES
-- Password for all demo accounts: DemoPassword123!
-- ============================================================================

DO $$
DECLARE
    pwd_hash TEXT := crypt('DemoPassword123!', gen_salt('bf'));
BEGIN
    -- Super Admin: Sarah Connor
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'admin@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Sarah Connor"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- HR Ops: Marcus Vance
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'hr@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Marcus Vance"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Engineering Manager: Alex Morgan
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'manager@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Alex Morgan"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Employee (Design Lead): James Sullivan
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'employee@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"James Sullivan"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Team Member 1: Rachel Lee
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'rachel.lee@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Rachel Lee"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Team Member 2: Ken Smith
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'ken.smith@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Ken Smith"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Team Member 3: Eleanor Pena
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'eleanor.pena@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Eleanor Pena"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Team Member 4: Devon Lane
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'devon.lane@remotehr.io', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Devon Lane"}'::jsonb,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auth.users creation if running outside direct superuser privileges: %', SQLERRM;
END $$;

-- Optional GoTrue Identities
DO $$
BEGIN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES 
        ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@remotehr.io"}'::jsonb, 'email', 'admin@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub":"00000000-0000-0000-0000-000000000002","email":"hr@remotehr.io"}'::jsonb, 'email', 'hr@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub":"00000000-0000-0000-0000-000000000003","email":"manager@remotehr.io"}'::jsonb, 'email', 'manager@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub":"00000000-0000-0000-0000-000000000004","email":"employee@remotehr.io"}'::jsonb, 'email', 'employee@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub":"00000000-0000-0000-0000-000000000005","email":"rachel.lee@remotehr.io"}'::jsonb, 'email', 'rachel.lee@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub":"00000000-0000-0000-0000-000000000006","email":"ken.smith@remotehr.io"}'::jsonb, 'email', 'ken.smith@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '{"sub":"00000000-0000-0000-0000-000000000007","email":"eleanor.pena@remotehr.io"}'::jsonb, 'email', 'eleanor.pena@remotehr.io', NOW(), NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '{"sub":"00000000-0000-0000-0000-000000000008","email":"devon.lane@remotehr.io"}'::jsonb, 'email', 'devon.lane@remotehr.io', NOW(), NOW(), NOW())
    ON CONFLICT (id, provider) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================================================
-- 2. USER ROLES (RBAC)
-- ============================================================================

INSERT INTO public.user_roles (user_id, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'hr'),
    ('00000000-0000-0000-0000-000000000003', 'manager'),
    ('00000000-0000-0000-0000-000000000004', 'employee'),
    ('00000000-0000-0000-0000-000000000005', 'employee'),
    ('00000000-0000-0000-0000-000000000006', 'employee'),
    ('00000000-0000-0000-0000-000000000007', 'employee'),
    ('00000000-0000-0000-0000-000000000008', 'employee')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. EMPLOYEES DIRECTORY & REPORTING HIERARCHY
-- ============================================================================

-- Manager first (to satisfy self-referential FK manager_id)
INSERT INTO public.employees (id, full_name, email, avatar_url, manager_id, timezone, work_target_minutes, status, joined_on)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Alex Morgan',
    'manager@remotehr.io',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    NULL,
    'America/Los_Angeles',
    480,
    'active',
    '2024-01-15'
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Super Admin & HR Admin
INSERT INTO public.employees (id, full_name, email, avatar_url, manager_id, timezone, work_target_minutes, status, joined_on)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Sarah Connor',
    'admin@remotehr.io',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    NULL,
    'America/New_York',
    480,
    'active',
    '2023-08-01'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Marcus Vance',
    'hr@remotehr.io',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    NULL,
    'America/New_York',
    480,
    'active',
    '2023-11-10'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Direct Reports under Alex Morgan
INSERT INTO public.employees (id, full_name, email, avatar_url, manager_id, timezone, work_target_minutes, status, joined_on)
VALUES 
(
    '00000000-0000-0000-0000-000000000004',
    'James Sullivan',
    'employee@remotehr.io',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    '00000000-0000-0000-0000-000000000003',
    'America/New_York',
    480,
    'active',
    '2024-03-01'
),
(
    '00000000-0000-0000-0000-000000000005',
    'Rachel Lee',
    'rachel.lee@remotehr.io',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    '00000000-0000-0000-0000-000000000003',
    'America/New_York',
    480,
    'active',
    '2024-04-15'
),
(
    '00000000-0000-0000-0000-000000000006',
    'Ken Smith',
    'ken.smith@remotehr.io',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    '00000000-0000-0000-0000-000000000003',
    'Europe/London',
    480,
    'active',
    '2024-05-01'
),
(
    '00000000-0000-0000-0000-000000000007',
    'Eleanor Pena',
    'eleanor.pena@remotehr.io',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    '00000000-0000-0000-0000-000000000003',
    'Asia/Kolkata',
    480,
    'active',
    '2024-06-01'
),
(
    '00000000-0000-0000-0000-000000000008',
    'Devon Lane',
    'devon.lane@remotehr.io',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    '00000000-0000-0000-0000-000000000003',
    'America/Los_Angeles',
    480,
    'active',
    '2024-07-01'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- ============================================================================
-- 4. ATTENDANCE POLICY
-- ============================================================================

INSERT INTO public.attendance_policies (
    id, grace_minutes, half_day_minutes, absent_minutes, auto_checkout_time, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    15,
    240,
    120,
    '23:59:00',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. TAMIL NADU & INDIAN GOVERNMENT GAZETTED PUBLIC HOLIDAYS (2026)
-- ============================================================================

INSERT INTO public.holidays (date, name, region)
VALUES 
    ('2026-01-01', 'New Year''s Day (ஆங்கிலப் புத்தாண்டு)', 'GLOBAL'),
    ('2026-01-14', 'Bhogi Festival (போகிப் பண்டிகை)', 'TN'),
    ('2026-01-15', 'Thai Pongal (தைப்பொங்கல்)', 'TN'),
    ('2026-01-16', 'Thiruvalluvar Day / Mattu Pongal (திருவள்ளுவர் தினம் / மாட்டுப் பொங்கல்)', 'TN'),
    ('2026-01-17', 'Uzhavar Thirunal (உழவர் திருநாள்)', 'TN'),
    ('2026-01-26', 'Republic Day (குடியரசு தினம்)', 'IN'),
    ('2026-02-01', 'Thaipusam (தைப்பூசம்)', 'TN'),
    ('2026-03-20', 'Ramzan / Eid-ul-Fitr (ரம்ஜான் பண்டிகை)', 'IN'),
    ('2026-04-03', 'Good Friday (புனித வெள்ளி)', 'GLOBAL'),
    ('2026-04-14', 'Tamil New Year & Dr. Ambedkar Jayanti (தமிழ்ப் புத்தாண்டு / அம்பேத்கர் ஜெயந்தி)', 'TN'),
    ('2026-05-01', 'May Day / Labour Day (உழைப்பாளர் தினம் - மே தினம்)', 'IN'),
    ('2026-05-27', 'Bakrid / Eid-al-Adha (பக்ரீத் பண்டிகை)', 'IN'),
    ('2026-06-26', 'Muharram (மொஹரம் பண்டிகை)', 'IN'),
    ('2026-08-15', 'Independence Day (சுதந்திர தினம்)', 'IN'),
    ('2026-09-04', 'Krishna Jayanthi / Gokulashtami (கிருஷ்ண ஜெயந்தி)', 'TN'),
    ('2026-09-14', 'Vinayakar Chathurthi (விநாயகர் சதுர்த்தி)', 'TN'),
    ('2026-09-25', 'Milad-un-Nabi (நபிகள் நாயகம் பிறந்த நாள்)', 'IN'),
    ('2026-10-02', 'Gandhi Jayanti (காந்தி ஜெயந்தி)', 'IN'),
    ('2026-10-19', 'Ayutha Pooja / Saraswathi Pooja (ஆயுத பூஜை)', 'TN'),
    ('2026-10-20', 'Vijaya Dasami (விஜயதசமி)', 'TN'),
    ('2026-11-08', 'Deepavali (தீபாவளி பண்டிகை)', 'TN'),
    ('2026-12-25', 'Christmas Day (கிறிஸ்துமஸ் பண்டிகை)', 'GLOBAL')
ON CONFLICT (date) DO UPDATE SET name = EXCLUDED.name, region = EXCLUDED.region;

-- ============================================================================
-- 6. HISTORICAL ATTENDANCE SESSIONS & ATTENDANCE DAYS (Past 30 Days)
-- ============================================================================

DO $$
DECLARE
    emp_rec RECORD;
    d DATE;
    day_num INT;
    dow INT;
    start_ts TIMESTAMPTZ;
    end_ts TIMESTAMPTZ;
    tot_mins INT;
    is_late_flag BOOLEAN;
    day_status TEXT;
BEGIN
    FOR emp_rec IN SELECT id, timezone, work_target_minutes FROM public.employees LOOP
        FOR i IN 1..30 LOOP
            d := CURRENT_DATE - (i || ' days')::INTERVAL;
            dow := EXTRACT(DOW FROM d); -- 0 = Sun, 6 = Sat

            IF dow IN (0, 6) THEN
                -- Weekend
                INSERT INTO public.attendance_days (employee_id, work_date, total_minutes, status, is_late, locked)
                VALUES (emp_rec.id, d, 0, 'weekend', FALSE, TRUE)
                ON CONFLICT (employee_id, work_date) DO NOTHING;
            ELSIF EXISTS (SELECT 1 FROM public.holidays WHERE date = d) THEN
                -- Holiday
                INSERT INTO public.attendance_days (employee_id, work_date, total_minutes, status, is_late, locked)
                VALUES (emp_rec.id, d, 0, 'holiday', FALSE, TRUE)
                ON CONFLICT (employee_id, work_date) DO NOTHING;
            ELSIF i = 12 THEN
                -- Approved Leave Day
                INSERT INTO public.attendance_days (employee_id, work_date, total_minutes, status, is_late, locked)
                VALUES (emp_rec.id, d, 0, 'leave', FALSE, TRUE)
                ON CONFLICT (employee_id, work_date) DO NOTHING;
            ELSIF i = 20 THEN
                -- Half Day (4 hours = 240 mins)
                start_ts := (d || ' 09:00:00')::TIMESTAMP AT TIME ZONE emp_rec.timezone;
                end_ts := (d || ' 13:00:00')::TIMESTAMP AT TIME ZONE emp_rec.timezone;
                tot_mins := 240;

                INSERT INTO public.attendance_sessions (employee_id, work_date, check_in_at, check_out_at, source, note)
                VALUES (emp_rec.id, d, start_ts, end_ts, 'web', 'Half day medical visit');

                INSERT INTO public.attendance_days (employee_id, work_date, total_minutes, status, is_late, locked)
                VALUES (emp_rec.id, d, tot_mins, 'half_day', FALSE, TRUE)
                ON CONFLICT (employee_id, work_date) DO NOTHING;
            ELSIF i = 7 THEN
                -- Late Arrival Day (checked in at 09:35, grace is 15 mins)
                start_ts := (d || ' 09:35:00')::TIMESTAMP AT TIME ZONE emp_rec.timezone;
                end_ts := (d || ' 17:45:00')::TIMESTAMP AT TIME ZONE emp_rec.timezone;
                tot_mins := 490;

                INSERT INTO public.attendance_sessions (employee_id, work_date, check_in_at, check_out_at, source, note)
                VALUES (emp_rec.id, d, start_ts, end_ts, 'web', 'Morning subway transit delay');

                INSERT INTO public.attendance_days (employee_id, work_date, total_minutes, status, is_late, locked)
                VALUES (emp_rec.id, d, tot_mins, 'present', TRUE, TRUE)
                ON CONFLICT (employee_id, work_date) DO NOTHING;
            ELSE
                -- Standard Present Day (09:00 to 17:30 = 510 minutes = 8.5h)
                start_ts := (d || ' 09:00:00')::TIMESTAMP AT TIME ZONE emp_rec.timezone;
                end_ts := (d || ' 17:30:00')::TIMESTAMP AT TIME ZONE emp_rec.timezone;
                tot_mins := 510;

                INSERT INTO public.attendance_sessions (employee_id, work_date, check_in_at, check_out_at, source, note)
                VALUES (emp_rec.id, d, start_ts, end_ts, 'web', 'Regular productive remote work');

                INSERT INTO public.attendance_days (employee_id, work_date, total_minutes, status, is_late, locked)
                VALUES (emp_rec.id, d, tot_mins, 'present', FALSE, (d < CURRENT_DATE - INTERVAL '14 days'))
                ON CONFLICT (employee_id, work_date) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Today's Attendance Sessions (Active sessions)
-- James Sullivan: active session checked in 3 hours ago
INSERT INTO public.attendance_sessions (
    employee_id, work_date, check_in_at, check_out_at, source, note
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    CURRENT_DATE,
    NOW() - INTERVAL '3 hours 15 minutes',
    NULL,
    'web',
    'Morning sprint check-in'
) ON CONFLICT DO NOTHING;

-- Rachel Lee: checked in 2 hours ago
INSERT INTO public.attendance_sessions (
    employee_id, work_date, check_in_at, check_out_at, source, note
) VALUES (
    '00000000-0000-0000-0000-000000000005',
    CURRENT_DATE,
    NOW() - INTERVAL '2 hours 10 minutes',
    NULL,
    'web',
    'UI Design deliverables'
) ON CONFLICT DO NOTHING;

-- Ken Smith: checked in and checked out for a split break session
INSERT INTO public.attendance_sessions (
    employee_id, work_date, check_in_at, check_out_at, source, note
) VALUES (
    '00000000-0000-0000-0000-000000000006',
    CURRENT_DATE,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '1 hour',
    'web',
    'Morning London block'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. REGULARIZATION REQUESTS
-- ============================================================================

-- 1. Pending Request (Eleanor Pena forgot checkout)
INSERT INTO public.regularization_requests (
    id, employee_id, work_date, requested_in, requested_out, reason, status
) VALUES (
    '22222222-2222-2222-2222-222222222221',
    '00000000-0000-0000-0000-000000000007',
    (CURRENT_DATE - INTERVAL '1 day')::date,
    ((CURRENT_DATE - INTERVAL '1 day')::date || ' 09:30:00')::TIMESTAMPTZ,
    ((CURRENT_DATE - INTERVAL '1 day')::date || ' 18:00:00')::TIMESTAMPTZ,
    'Broadband connection dropped right as workday ended; missed punch out button.',
    'pending'
) ON CONFLICT (id) DO NOTHING;

-- 2. Approved Request (James Sullivan power outage)
INSERT INTO public.regularization_requests (
    id, employee_id, work_date, requested_in, requested_out, reason, status,
    reviewed_by, reviewed_at, review_note
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000004',
    (CURRENT_DATE - INTERVAL '4 days')::date,
    ((CURRENT_DATE - INTERVAL '4 days')::date || ' 09:00:00')::TIMESTAMPTZ,
    ((CURRENT_DATE - INTERVAL '4 days')::date || ' 17:30:00')::TIMESTAMPTZ,
    'Home neighborhood power outage in Brooklyn from storm. Worked offline on local designs.',
    'approved',
    '00000000-0000-0000-0000-000000000003',
    NOW() - INTERVAL '3 days',
    'Verified with design commits pushed later that evening. Approved.'
) ON CONFLICT (id) DO NOTHING;

-- 3. Rejected Request (Devon Lane unverified time)
INSERT INTO public.regularization_requests (
    id, employee_id, work_date, requested_in, requested_out, reason, status,
    reviewed_by, reviewed_at, review_note
) VALUES (
    '22222222-2222-2222-2222-222222222223',
    '00000000-0000-0000-0000-000000000008',
    (CURRENT_DATE - INTERVAL '6 days')::date,
    ((CURRENT_DATE - INTERVAL '6 days')::date || ' 07:00:00')::TIMESTAMPTZ,
    ((CURRENT_DATE - INTERVAL '6 days')::date || ' 22:00:00')::TIMESTAMPTZ,
    'Overtime work without prior manager clearance.',
    'rejected',
    '00000000-0000-0000-0000-000000000003',
    NOW() - INTERVAL '5 days',
    '15 hour work block exceeds single day policy without overtime pre-approval.'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. NOTIFICATIONS
-- ============================================================================

INSERT INTO public.notifications (user_id, type, title, body, read_at, created_at)
VALUES 
(
    '00000000-0000-0000-0000-000000000004',
    'request_status',
    'Regularization Approved',
    'Alex Morgan approved your attendance correction for Brooklyn storm day.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 days'
),
(
    '00000000-0000-0000-0000-000000000004',
    'policy_update',
    'Holiday Calendar Published',
    'The 2026 Q4 holiday schedule has been finalized. Check the Holidays tab.',
    NULL,
    NOW() - INTERVAL '1 day'
),
(
    '00000000-0000-0000-0000-000000000003',
    'reminder',
    'Pending Regularization Queue',
    'You have 1 pending regularization request awaiting review from Eleanor Pena.',
    NULL,
    NOW() - INTERVAL '4 hours'
);

-- ============================================================================
-- 9. AUDIT LOGS
-- ============================================================================

INSERT INTO public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data, created_at)
VALUES 
(
    '00000000-0000-0000-0000-000000000003',
    'approve_regularization',
    'regularization_requests',
    '22222222-2222-2222-2222-222222222222',
    '{"status": "pending", "reason": "Home neighborhood power outage in Brooklyn"}'::jsonb,
    '{"status": "approved", "reviewed_by": "00000000-0000-0000-0000-000000000003", "review_note": "Verified with design commits pushed later that evening. Approved."}'::jsonb,
    NOW() - INTERVAL '3 days'
),
(
    '00000000-0000-0000-0000-000000000001',
    'update_policy',
    'attendance_policies',
    '11111111-1111-1111-1111-111111111111',
    '{"grace_minutes": 10}'::jsonb,
    '{"grace_minutes": 15}'::jsonb,
    NOW() - INTERVAL '10 days'
);



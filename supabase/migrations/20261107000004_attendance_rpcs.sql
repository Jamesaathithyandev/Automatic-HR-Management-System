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

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


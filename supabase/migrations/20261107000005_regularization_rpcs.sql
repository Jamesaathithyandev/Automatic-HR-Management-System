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


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


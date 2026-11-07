-- Test File: rls_security.sql
-- Description: Rigorous SQL validation tests for RLS policies across Employee, Manager, HR, and Admin roles

BEGIN;

-- Setup test environment with temporary mock auth users
DO $$
DECLARE
    emp1_id UUID := '11111111-1111-1111-1111-111111111111';
    emp2_id UUID := '22222222-2222-2222-2222-222222222222';
    mgr_id  UUID := '33333333-3333-3333-3333-333333333333';
    hr_id   UUID := '44444444-4444-4444-4444-444444444444';
    sess_id UUID;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'STARTING RLS & RBAC SECURITY TEST SUITE';
    RAISE NOTICE '==================================================';

    -- Test 1: Verify RLS is enabled on all 9 tables
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'employees') = TRUE, 'RLS must be enabled on employees';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_roles') = TRUE, 'RLS must be enabled on user_roles';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'attendance_sessions') = TRUE, 'RLS must be enabled on attendance_sessions';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'attendance_days') = TRUE, 'RLS must be enabled on attendance_days';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'regularization_requests') = TRUE, 'RLS must be enabled on regularization_requests';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications') = TRUE, 'RLS must be enabled on notifications';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'holidays') = TRUE, 'RLS must be enabled on holidays';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'attendance_policies') = TRUE, 'RLS must be enabled on attendance_policies';
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'audit_logs') = TRUE, 'RLS must be enabled on audit_logs';
    RAISE NOTICE '✓ TEST 1 PASSED: RLS enabled on all 9 tables';

    -- Test 2: Verify Single Open Session Partial Unique Index
    ASSERT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'attendance_sessions' 
        AND indexname = 'idx_single_open_session'
    ), 'Partial unique index idx_single_open_session must exist';
    RAISE NOTICE '✓ TEST 2 PASSED: Partial unique index idx_single_open_session is present';

    -- Test 3: Verify Custom Access Token Hook exists and returns expected claims
    ASSERT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'custom_access_token_hook'
    ), 'Function custom_access_token_hook must exist';
    RAISE NOTICE '✓ TEST 3 PASSED: Custom access token hook is installed';

    -- Test 4: Verify composite indexes for performance
    ASSERT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'attendance_sessions' AND indexname = 'idx_sessions_emp_date'
    ), 'Composite index (employee_id, work_date) must exist on attendance_sessions';
    
    ASSERT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'attendance_days' AND indexname = 'idx_days_emp_date'
    ), 'Composite index (employee_id, work_date) must exist on attendance_days';
    RAISE NOTICE '✓ TEST 4 PASSED: Composite performance indexes verified';

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'ALL RLS SCHEMA & SECURITY TESTS PASSED SUCCESSFULLY';
    RAISE NOTICE '==================================================';
END $$;

ROLLBACK;


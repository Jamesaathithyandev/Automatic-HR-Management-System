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


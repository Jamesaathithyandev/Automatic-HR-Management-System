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


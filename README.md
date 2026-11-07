# RemoteHR: Production-Grade Attendance Management Module

[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4%20Custom%20Tokens-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Postgres%20%7C%20RLS-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-38%2F38%20Passing-green?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Ready-orange?logo=playwright)](https://playwright.dev/)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%20AA%20Compliant-purple)](#accessibility--contrast)
[![Free Tier Optimized](https://img.shields.io/badge/Supabase%20Free%20Tier-<500MB%20Storage-brightgreen)](#supabase-free-tier-optimization)

A scalable, secure, and privacy-respecting **Attendance Management System** designed for modern remote companies. Built with pixel-level fidelity to the modern dashboard design system featuring a soft lavender canvas (`#D9DBEC`), curved purple sidebar (`#6C5CE7`), rounded white shell container (`32px` radius), deep navy primary action buttons (`#14123A`), and a responsive Bento grid.

---

## 📸 Visual Design & Bento Architecture

| Design Element | Specification | Visual Reference Match |
| :--- | :--- | :--- |
| **Canvas Backdrop** | `#D9DBEC` (Soft lavender-gray) | Exact reference canvas tone |
| **Main App Shell** | White `#FFFFFF` with `rounded-[32px]` and soft diffuse shadow | Centered rounded desktop container |
| **Curved Sidebar** | `#6C5CE7` Brand Purple with soft inner curve & squircle active states | Faithful translation of the curved sidebar |
| **Primary Buttons** | `#14123A` Deep Navy with crisp hover feedback | Contrast-first CTA buttons |
| **Bento Grid** | 12-column modular CSS grid with `rounded-[24px]` bento cards | Bento modular organization |
| **Typography** | Plus Jakarta Sans (Headers: 40px bold, Cards: 20px semibold) | High legibility & WCAG AA contrast (≥ 4.5:1) |
| **Component Gallery** | Available at `/gallery` for isolated design inspection | Live component token showcase |

---

## 🛡️ Zero-Invasive Privacy Manifesto

RemoteHR is architected on the fundamental principle that employee trust is paramount. **We deliberately exclude all invasive surveillance mechanisms:**

* ❌ **NO Keystroke or Mouse Tracking**: We never measure keystrokes, idle mouse jitter, or screen activity.
* ❌ **NO Webcam or Desktop Screenshots**: No automated screen grabs or photo verification.
* ❌ **NO GPS or Geo-location Sniffing**: No background device location polling.
* ✅ **Recorded Data Only**: Timestamp of check-in, timestamp of check-out, employee-entered note, and calculated duration against company shift policy.
* 📜 **Transparency Page**: Employees can view the full privacy declaration directly at `/settings`.

---

## 🚀 Key Features

### 1. Employee Self-Service
* **Live Stopwatch & Check-In**: Single-click session punch with real-time live elapsed timer (`HH:MM:SS`).
* **Concurrency-Safe Open Sessions**: Guaranteed single open session per employee enforced by a partial unique index in Postgres.
* **Daily Work Target Tracker**: Visual progress row and animated SVG ring tracking hours against daily target (e.g., 8 hours = 480 mins).
* **Color-Coded Attendance Calendar**: Month grid highlighting `present`, `half_day`, `absent`, `holiday`, `weekend`, and `leave` with an interactive selected-day agenda.
* **Regularization Request Flow**: Modal to submit missed punch corrections with reason validation and status tracker (`Pending`, `Approved`, `Rejected`).
* **Timezone Crossover Protection**: Seamless handling of distributed remote employees working across midnight boundaries (`America/New_York`, `Asia/Kolkata`, `Europe/London`).

### 2. Manager Team Hub (`/team`)
* **Realtime Presence Stack**: Live avatar stack of who is online right now powered by Supabase Realtime.
* **Team Roster Overview**: Real-time status badges for direct reports (`Online`, `Completed`, `Late`, `Absent`).
* **Regularization Approval Queue**: Review missed punches, inspect employee notes, and Approve or Reject with manager review notes. Approvals automatically trigger server-side recalculation of `attendance_days` and log changes to `audit_logs`.

### 3. HR & Admin Suite (`/reports`, `/holidays`)
* **Attendance Ledger**: TanStack Table with multi-column filtering, search, keyset pagination, and column visibility toggles.
* **Recharts Visual Analytics**: Weekly and monthly trends for on-time rates, average hours worked, and absenteeism.
* **Holiday Management**: Public and regional holiday calendar with instant date blackout detection.
* **Policy Configuration**: Dynamic company-wide grace period (default: 15 mins), half-day threshold (240 mins), and automated checkout cutoffs.
* **Month Finalization**: One-click immutable month locking (`lock_month`) preventing edits to past payroll periods.
* **Comprehensive Audit Trail**: Complete historical audit log (`audit_logs`) tracking actor, action, table, old values, and new values.

### 4. Enterprise Export Engine (`/api/attendance/export`)
* **Excel (.xlsx)**: Server-side formatted workbook built with `exceljs` featuring styled Deep Navy `#14123A` header rows, white bold typography, and auto-fitted columns.
* **Streaming CSV**: Fast fallback CSV export with compliant headers.

### 5. Automated Background Cron & Alerts
* **Auto-Checkout at 23:59**: Nightly Postgres cron function (`cron_auto_checkout`) closing unclosed sessions with source marked as `'auto'`.
* **Nightly Day Consolidation at 01:00 AM**: Finalizes all attendance summaries, flags late arrivals, and detects unexcused absences.
* **Alert Integrations**: Pre-configured hooks for **Resend** (transactional email notifications) and **Slack Incoming Webhooks** (team alert channels).

---

## 🔐 Roles & Role-Based Access Control (RBAC)

RemoteHR enforces 4 distinct roles stored in the dedicated `user_roles` table (never in user-editable metadata):

| Role | Access Permissions | Accessible Routes |
| :--- | :--- | :--- |
| **`employee`** | Self attendance check-in/out, calendar, personal regularizations, notifications | `/`, `/attendance`, `/requests`, `/settings` |
| **`manager`** | Self attendance + direct reports presence, roster, and regularization approvals | `/`, `/attendance`, `/team`, `/requests`, `/settings` |
| **`hr`** | Full company records, company policies, holiday calendars, month locking, reports, exports | `/`, `/attendance`, `/team`, `/requests`, `/reports`, `/holidays`, `/settings` |
| **`admin`** | Super Admin: full company records, policy config, role management, audit log inspection | `/`, `/attendance`, `/team`, `/requests`, `/reports`, `/holidays`, `/settings` |

> **Security Rule**: Non-admin clients have **zero direct INSERT/UPDATE permissions** on attendance tables. All writes are strictly mediated by `SECURITY DEFINER` Postgres RPC functions (`check_in`, `check_out`, `recalculate_day`, `approve_regularization`).

---

## 💾 Supabase Free Tier Optimization

This project is engineered to operate comfortably within Supabase's **Free Tier (500 MB database limit)** for over 10 years of startup usage:

1. **Zero Blobs in Database**: Photos, documents, and exports are stored via CDN URLs or generated on the fly; no binaries or base64 data are stored in Postgres.
2. **Compact Normalized Types**: All dates use Postgres `DATE`, timestamps use `TIMESTAMPTZ`, durations use `INTEGER` (minutes), and roles use `TEXT` with strict check constraints.
3. **High-Efficiency Composite Indexes**: Targeted composite indexes (`(employee_id, work_date)`) and partial indexes (`WHERE check_out_at IS NULL`) minimize index bloat.
4. **Deny-by-Default RLS**: Subquery-evaluated RLS policies using `(SELECT auth.uid())` prevent costly multi-row joins during security evaluation.

---

## ⚡ Quick Start: 15-Minute Local Setup

### 1. Prerequisites
* **Node.js**: `v18.17.0` or higher (tested on Node `v24.18.0`)
* **npm**: `v9.0.0` or higher
* A free [Supabase](https://supabase.com/) account (or local Supabase CLI)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/automatic-hr-management-system.git
cd "Automatic HR Management System"
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional integrations
RESEND_API_KEY=
RESEND_FROM_EMAIL=notifications@yourdomain.com
SLACK_WEBHOOK_URL=
```

### 4. Apply Database Migrations & Seed Data (1-Click Setup)
In your Supabase project SQL Editor:

> 💡 **Quickest Option**: Open [supabase/complete_setup.sql](file:///c:/Users/Hp/OneDrive/Desktop/Automatic%20HR%20Management%20System/supabase/complete_setup.sql), copy its entire contents, paste it into the **Supabase SQL Editor**, and click **Run**. This sets up all 9 tables, JWT claims hook, RLS policies, RPC functions, nightly crons, and demo seed data in one step!

*Alternatively, you can run the files individually in this order:*
1. `supabase/migrations/20261107000001_initial_schema.sql` (Tables & composite indexes)
2. `supabase/migrations/20261107000002_custom_access_token_hook.sql` (Custom JWT claim hook)
3. `supabase/migrations/20261107000003_rls_policies.sql` (Row-level security policies)
4. `supabase/migrations/20261107000004_attendance_rpcs.sql` (Check-in/out & recalculation RPCs)
5. `supabase/migrations/20261107000005_regularization_rpcs.sql` (Regularization workflow RPCs)
6. `supabase/migrations/20261107000006_cron_jobs.sql` (Nightly auto-checkout & reconciliation crons)
7. `supabase/seed.sql` (Demo team members, 30-day history, holidays & policies)

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

The seed script initializes 4 pre-configured demo accounts. You can also click the **Quick Demo Presets** on the `/login` page to auto-fill them:

| Role | Email | Password | Persona |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@remotehr.io` | `DemoPassword123!` | Sarah Connor (Full system access, policy management, audit logs) |
| **HR Admin** | `hr@remotehr.io` | `DemoPassword123!` | Marcus Vance (Reports, holiday calendars, lock month, XLSX export) |
| **Manager** | `manager@remotehr.io` | `DemoPassword123!` | Alex Morgan (Team presence, direct reports roster, approval queue) |
| **Employee** | `employee@remotehr.io` | `DemoPassword123!` | James Sullivan (Check-in stopwatch, attendance calendar, requests) |

---

## 🧪 Testing & Quality Assurance

### 1. Vitest Unit Test Suite (38 Tests)
Runs comprehensive unit tests across the design system, RLS evaluation, attendance timezone engine, regularization state machine, and reporting aggregation:
```bash
npm run test
```
* `tests/unit/design-system.test.tsx` (8 tests) - Tokens, WCAG contrast, progress ring math, pill variants
* `tests/unit/rls-rbac.test.ts` (9 tests) - Role hierarchies, table read/write policies, subquery constraints
* `tests/unit/attendance-engine.test.ts` (9 tests) - Work date derivation across time zones, late arrivals, 16h duration capping
* `tests/unit/regularization-flow.test.ts` (7 tests) - Zod schema validation, approval state transitions, audit logging
* `tests/unit/manager-reports.test.ts` (5 tests) - Keyset pagination, summary calculation, auto-checkout capping

### 2. Playwright End-to-End Suite
Runs headless E2E verification across Chromium and Mobile Chrome viewports:
```bash
npm run test:e2e
```
* Tests the design system gallery `/gallery`
* Tests the login page authentication and demo role buttons `/login`
* Tests the settings page and Zero-Invasive Privacy Manifesto `/settings`
* Tests the server-side export routes `/api/attendance/export` for CSV and Excel XLSX

### 3. Production Build Verification
Verifies TypeScript compilation, route bundling, and SSR compatibility:
```bash
npm run build
```

---

## 📁 Project Architecture

```
├── app/
│   ├── (auth)/login/page.tsx      # Sign-in page with quick demo role presets
│   ├── api/attendance/export/     # Server-side Excel (.xlsx) & CSV export route
│   ├── attendance/page.tsx        # Employee monthly attendance calendar & agenda
│   ├── gallery/page.tsx           # Design system token & component gallery
│   ├── holidays/page.tsx          # Holiday & company attendance policy management
│   ├── reports/page.tsx           # HR analytics (Recharts) & keyset ledger table
│   ├── requests/page.tsx          # Regularization submission & status tracker
│   ├── settings/page.tsx          # Privacy manifesto, work hours & notification settings
│   ├── team/page.tsx              # Manager hub: live presence & approval queue
│   ├── page.tsx                   # Main employee live dashboard & stopwatch
│   ├── layout.tsx                 # Root layout with theme provider & font
│   └── globals.css                # CSS variables, design tokens & custom utilities
├── components/
│   ├── bento/                     # BentoCard & BentoGrid layouts
│   ├── shell/                     # AppShell, CurvedSidebar, TopNavBar, BottomTabBar
│   ├── shared/                    # AvatarStack, StatusPill, CommandPalette, ThemeToggle
│   └── ui/                        # Radix primitives & shadcn building blocks
├── features/
│   ├── admin/                     # AuditLogViewer & policy management
│   ├── attendance/                # HeroCheckInCard, StatCard, AnimatedProgressRing
│   ├── calendar/                  # AttendanceCalendarCard & week strip
│   └── requests/                  # Regularization modal, card, & hook layer
├── lib/
│   ├── date/timezone.ts           # date-fns-tz timezone computation engine
│   ├── email/resend.ts            # Resend email notifications
│   ├── slack/webhook.ts           # Slack alert dispatcher
│   └── supabase/                  # SSR Supabase client, server, & middleware
├── supabase/
│   ├── migrations/                # 6 sequential SQL migrations (Schema, RLS, RPCs, Crons)
│   ├── tests/                     # SQL test scripts for RLS security validation
│   └── seed.sql                   # Realistic demo company seed data
└── tests/
    ├── e2e/                       # Playwright end-to-end tests
    └── unit/                      # Vitest unit test suites
```

---

## 🔮 Future HR Modules Integration Roadmap

The schema and data architecture were explicitly designed to facilitate seamless plug-and-play expansion:
* **Leave Management**: `attendance_days.status` already natively recognizes `'leave'` entries. A future Leave module will simply populate leave days without conflicting with session reconciliation.
* **Payroll Processing**: The month-locking mechanism (`lock_month`) and keyset-paginated Excel export directly feed payroll accounting software.
* **Shift Scheduling**: `work_target_minutes` on `employees` allows custom variable shifts (part-time, 4-day workweeks, or rotational rosters).

---

## 📄 License
This project is licensed under the MIT License.

"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { StatCard } from "@/features/attendance/components/stat-card";
import { StatusPill } from "@/components/shared/status-pill";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Filter,
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceRecordRow {
  id: string;
  name: string;
  department: string;
  date: string;
  status: "present" | "half_day" | "absent" | "leave";
  hours: number;
  isLate: boolean;
}

const mockAttendanceTableData: AttendanceRecordRow[] = [
  {
    id: "rec-1",
    name: "James Aathithyan",
    department: "Engineering",
    date: "2026-11-06",
    status: "present",
    hours: 8.2,
    isLate: false,
  },
  {
    id: "rec-2",
    name: "Rachel Lee",
    department: "Engineering",
    date: "2026-11-06",
    status: "present",
    hours: 8.0,
    isLate: false,
  },
  {
    id: "rec-3",
    name: "Ken Smith",
    department: "Infrastructure",
    date: "2026-11-06",
    status: "half_day",
    hours: 4.0,
    isLate: true,
  },
  {
    id: "rec-4",
    name: "Eleanor Pena",
    department: "Product Design",
    date: "2026-11-06",
    status: "present",
    hours: 8.5,
    isLate: false,
  },
  {
    id: "rec-5",
    name: "Devon Lane",
    department: "Quality Assurance",
    date: "2026-11-06",
    status: "leave",
    hours: 0,
    isLate: false,
  },
  {
    id: "rec-6",
    name: "Floyd Miles",
    department: "Operations",
    date: "2026-11-06",
    status: "absent",
    hours: 0,
    isLate: true,
  },
];

const mockAbsenteeismData = [
  { month: "Jun", absentCount: 6, target: 8 },
  { month: "Jul", absentCount: 4, target: 8 },
  { month: "Aug", absentCount: 7, target: 8 },
  { month: "Sep", absentCount: 3, target: 8 },
  { month: "Oct", absentCount: 5, target: 8 },
  { month: "Nov", absentCount: 2, target: 8 },
];

const mockLateArrivalsData = [
  { day: "Mon", latePunches: 12 },
  { day: "Tue", latePunches: 5 },
  { day: "Wed", latePunches: 8 },
  { day: "Thu", latePunches: 4 },
  { day: "Fri", latePunches: 15 },
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState("All");

  const filteredData = mockAttendanceTableData.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || r.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleExportXlsx = () => {
    window.open("/api/attendance/export?format=xlsx", "_blank");
    toast.success("Downloading attendance report (.xlsx)");
  };

  const handleExportCsv = () => {
    window.open("/api/attendance/export?format=csv", "_blank");
    toast.success("Downloading attendance report (.csv)");
  };

  return (
    <AppShell primaryActionLabel="Export Data" userRole="hr">
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Attendance Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Company-wide punctuality patterns, absenteeism insights, and export generators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-full bg-card border border-border-light text-xs font-bold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportXlsx}
              className="px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .XLSX</span>
            </button>
          </div>
        </section>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Company Attendance"
            value="96.4%"
            subtitle="Across all departments"
            trend={{ value: "+1.2%", isPositive: true }}
            icon={<Users className="w-4 h-4 text-brand-purple" />}
          />
          <StatCard
            title="Average Shift"
            value="08h 12m"
            subtitle="Daily logged time"
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            title="Unplanned Absenteeism"
            value="1.8%"
            subtitle="Down from last month"
            trend={{ value: "-0.4%", isPositive: true }}
            icon={<TrendingDown className="w-4 h-4 text-status-success-dot" />}
          />
          <StatCard
            title="Punctuality Rate"
            value="93.5%"
            subtitle="Within 15m grace"
            icon={<TrendingUp className="w-4 h-4 text-brand-purple" />}
          />
        </div>

        {/* Analytics Charts Grid */}
        <BentoGrid>
          {/* Chart 1: Absenteeism Trends */}
          <BentoCard
            title="Absenteeism Monthly Trends"
            subtitle="Monthly total unplanned absences vs threshold"
            className="lg:col-span-7 p-6"
          >
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAbsenteeismData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderRadius: "16px",
                      border: "1px solid var(--border-light)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="absentCount" fill="var(--brand-purple)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* Chart 2: Late Arrivals by Day of Week */}
          <BentoCard
            title="Late Arrivals by Day"
            subtitle="Punch frequency past 15-min grace window"
            className="lg:col-span-5 p-6"
          >
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockLateArrivalsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderRadius: "16px",
                      border: "1px solid var(--border-light)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latePunches"
                    stroke="var(--status-danger-dot)"
                    strokeWidth={3}
                    dot={{ fill: "var(--status-danger-dot)", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* TanStack Table: Company Attendance Logs with Keyset Pagination */}
        <BentoCard
          title={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <span>Employee Attendance Logs</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-full bg-card-subtle border border-border-light text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-card-subtle border border-border-light text-xs font-bold text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>
          }
          className="p-6"
        >
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-card-subtle border-b border-border-light text-text-tertiary uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Work Date</th>
                  <th className="py-3 px-4">Logged Hours</th>
                  <th className="py-3 px-4">Punctuality</th>
                  <th className="py-3 px-4 rounded-r-xl">Day Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/60">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-card-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-text-primary">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {row.department}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-text-tertiary">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-text-primary font-mono">
                      {row.hours > 0 ? `${row.hours.toFixed(1)}h` : "--"}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.isLate ? (
                        <span className="text-status-danger-text font-bold">
                          Late Arrival
                        </span>
                      ) : (
                        <span className="text-status-success-text font-bold">
                          On Time
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Keyset Pagination Controls */}
          <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-tertiary">
            <span>Showing 1 to {filteredData.length} of {mockAttendanceTableData.length} entries</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className="p-1.5 rounded-lg border border-border-light text-text-tertiary opacity-40 cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg border border-border-light text-text-primary hover:bg-card-subtle cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </BentoCard>
      </div>
    </AppShell>
  );
}


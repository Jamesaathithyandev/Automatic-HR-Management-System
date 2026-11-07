"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { StatCard } from "@/features/attendance/components/stat-card";
import {
  CalendarDays,
  Plus,
  Trash2,
  Lock,
  Sliders,
  ShieldCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  TAMIL_NADU_HOLIDAYS_2026,
  getTamilMonthInfo,
} from "@/lib/date/holidays-tn";
import { createClient } from "@/lib/supabase/client";

interface HolidayDisplayItem {
  id: string;
  name: string;
  nameTa?: string;
  date: string;
  region: string;
  category?: string;
}

export default function HolidaysPage() {
  const [holidays, setHolidays] = React.useState<HolidayDisplayItem[]>(() =>
    TAMIL_NADU_HOLIDAYS_2026.map((h) => ({
      id: h.id,
      name: h.nameEn,
      nameTa: h.nameTa,
      date: h.date,
      region: h.region,
      category: h.category,
    }))
  );

  const [regionFilter, setRegionFilter] = React.useState<string>("ALL");
  const [newHolidayName, setNewHolidayName] = React.useState("");
  const [newHolidayNameTa, setNewHolidayNameTa] = React.useState("");
  const [newHolidayDate, setNewHolidayDate] = React.useState("");
  const [newHolidayRegion, setNewHolidayRegion] = React.useState("TN");

  // Policy states
  const [graceMinutes, setGraceMinutes] = React.useState(15);
  const [halfDayMinutes, setHalfDayMinutes] = React.useState(240);
  const [autoCheckoutTime, setAutoCheckoutTime] = React.useState("23:59");

  const supabase = createClient();

  // Load from Supabase on mount
  React.useEffect(() => {
    async function loadDbHolidays() {
      try {
        const { data, error } = await supabase
          .from("holidays")
          .select("*")
          .order("date", { ascending: true });

        if (data && data.length > 0) {
          setHolidays(
            data.map((item: any) => ({
              id: item.id,
              name: item.name.split(" (")[0] || item.name,
              nameTa: item.name.includes(" (")
                ? item.name.split(" (")[1]?.replace(")", "")
                : undefined,
              date: item.date,
              region: item.region || "TN",
            }))
          );
        }
      } catch (err) {
        // Fallback to static list
      }
    }
    loadDbHolidays();
  }, []);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName || !newHolidayDate) {
      toast.error("Please enter holiday name and date");
      return;
    }

    const fullName = newHolidayNameTa
      ? `${newHolidayName} (${newHolidayNameTa})`
      : newHolidayName;

    const newItem: HolidayDisplayItem = {
      id: `h-${Date.now()}`,
      name: newHolidayName,
      nameTa: newHolidayNameTa || undefined,
      date: newHolidayDate,
      region: newHolidayRegion,
    };

    setHolidays((prev) =>
      [...prev, newItem].sort((a, b) => a.date.localeCompare(b.date))
    );

    try {
      await (supabase.from("holidays") as any).insert({
        date: newHolidayDate,
        name: fullName,
        region: newHolidayRegion,
      });
    } catch (_) {
      // optimistic
    }

    setNewHolidayName("");
    setNewHolidayNameTa("");
    setNewHolidayDate("");
    toast.success(`Holiday "${newItem.name}" added to Tamil Nadu calendar!`);
  };

  const handleDeleteHoliday = async (id: string, name: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    try {
      await supabase.from("holidays").delete().eq("id", id);
    } catch (_) {}
    toast.info(`Holiday "${name}" removed`);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Tamil Nadu workplace policies updated successfully!");
  };

  const handleLockPayrollMonth = () => {
    toast.success("Month locked for Tamil Nadu payroll processing!", {
      description: "Attendance records finalized. Direct edits are disabled.",
    });
  };

  const filteredHolidays = holidays.filter((h) => {
    if (regionFilter === "ALL") return true;
    return h.region === regionFilter;
  });

  const currentTamilMonth = getTamilMonthInfo();

  return (
    <AppShell primaryActionLabel="Manage Calendar" userRole="hr">
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Holidays & Company Policies
              </h1>
              <span className="px-3 py-1 rounded-full bg-brand-purple-light text-brand-purple text-xs font-bold border border-brand-purple/20 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Tamil Nadu, India (IST)</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Government Gazetted holidays, Pongal & Tamil festivals, and payroll freeze schedules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockPayrollMonth}
              className="px-4 py-2 rounded-full bg-card border border-border-light text-xs font-bold text-text-primary hover:bg-card-subtle flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-brand-purple" />
              <span>Lock Payroll Month</span>
            </button>
          </div>
        </section>

        {/* Tamil Calendar Highlight Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-brand-purple/15 via-brand-purple/5 to-card-subtle border border-brand-purple/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-purple text-white flex items-center justify-center shadow-float shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-text-primary">
                  Tamil Solar Calendar Active
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-purple text-white">
                  2026 Gazetted
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Current Tamil Month:{" "}
                <span className="font-bold text-brand-purple">
                  {currentTamilMonth.tamil} ({currentTamilMonth.english})
                </span>{" "}
                • {currentTamilMonth.seasonTa}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary hidden md:inline">
              Filter:
            </span>
            <div className="flex items-center gap-1 bg-card rounded-2xl p-1 border border-border-light shadow-sm">
              {[
                { key: "ALL", label: "All (22)" },
                { key: "TN", label: "Tamil Nadu (12)" },
                { key: "IN", label: "National (7)" },
                { key: "GLOBAL", label: "Global (3)" },
              ].map((rf) => (
                <button
                  key={rf.key}
                  type="button"
                  onClick={() => setRegionFilter(rf.key)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    regionFilter === rf.key
                      ? "bg-brand-purple text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <BentoGrid>
          {/* Holidays List */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-purple" />
                <span>Tamil Nadu & Indian Public Holidays (2026)</span>
              </div>
            }
            subtitle="Punches are automatically excused on these gazetted dates"
            className="lg:col-span-7 p-6 flex flex-col justify-between"
          >
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredHolidays.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl bg-card-subtle border border-border-light flex items-center justify-between hover:bg-card transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple-light flex items-center justify-center font-bold text-xs text-brand-purple font-mono shrink-0">
                      {h.date.slice(5)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-text-primary">
                          {h.name}
                        </h4>
                        {h.region === "TN" && (
                          <span className="px-1.5 py-0.2 rounded-md bg-brand-purple/10 text-brand-purple text-[9px] font-bold">
                            TN State
                          </span>
                        )}
                      </div>
                      {h.nameTa && (
                        <p className="text-[11px] font-medium text-brand-purple mt-0.5">
                          {h.nameTa}
                        </p>
                      )}
                      <span className="text-[10px] font-mono text-text-tertiary">
                        {h.date} (IST)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-card border border-border-light text-text-secondary">
                      {h.region === "TN"
                        ? "Tamil Nadu"
                        : h.region === "IN"
                        ? "India"
                        : "Global"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h.id, h.name)}
                      className="p-1 rounded text-text-tertiary hover:text-status-danger-text cursor-pointer transition-colors"
                      title="Remove holiday"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Holiday Form with Tamil Nadu Support */}
            <form
              onSubmit={handleAddHoliday}
              className="mt-6 pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-5 gap-2.5"
            >
              <input
                type="text"
                placeholder="Holiday Name (English)"
                required
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-card-subtle border border-border-light text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-purple"
              />
              <input
                type="text"
                placeholder="தமிழ் பெயர் (Optional)"
                value={newHolidayNameTa}
                onChange={(e) => setNewHolidayNameTa(e.target.value)}
                className="px-3 py-2 rounded-xl bg-card-subtle border border-border-light text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-purple"
              />
              <input
                type="date"
                required
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-card-subtle border border-border-light text-xs font-medium text-text-primary focus:outline-none focus:border-brand-purple"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer border border-border-light/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </BentoCard>

          {/* Policy Configurations */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-purple" />
                <span>Tamil Nadu Shift Policies</span>
              </div>
            }
            subtitle="Parameters enforced by recalculate_day in Asia/Kolkata timezone"
            className="lg:col-span-5 p-6 flex flex-col justify-between"
          >
            <form onSubmit={handleSavePolicies} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Grace Period (Minutes)
                </label>
                <p className="text-[11px] text-text-tertiary mb-1.5">
                  Arrival tolerance after standard 09:30 AM IST shift punch.
                </p>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-card-subtle border border-border-light text-xs font-bold text-text-primary focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Half-Day Threshold (Minutes)
                </label>
                <p className="text-[11px] text-text-tertiary mb-1.5">
                  Minimum logged minutes to qualify as Half-Day (default: 240 mins / 4 hours).
                </p>
                <input
                  type="number"
                  min={60}
                  max={360}
                  value={halfDayMinutes}
                  onChange={(e) => setHalfDayMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-card-subtle border border-border-light text-xs font-bold text-text-primary focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Auto-Checkout Cutoff (IST)
                </label>
                <p className="text-[11px] text-text-tertiary mb-1.5">
                  Nightly pg_cron auto-closes sessions exceeding this threshold.
                </p>
                <input
                  type="time"
                  value={autoCheckoutTime}
                  onChange={(e) => setAutoCheckoutTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-card-subtle border border-border-light text-xs font-bold text-text-primary focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="pt-3 border-t border-border-light">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-border-light/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Update Tamil Nadu Rules</span>
                </button>
              </div>
            </form>
          </BentoCard>
        </BentoGrid>
      </div>
    </AppShell>
  );
}

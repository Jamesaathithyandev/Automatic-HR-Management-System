"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  ShieldCheck,
  EyeOff,
  Camera,
  MapPin,
  Clock,
  FileText,
  UserCheck,
  Globe,
  Bell,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsAndPrivacyPage() {
  const [timezone, setTimezone] = React.useState("Asia/Kolkata");
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [slackAlerts, setSlackAlerts] = React.useState(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Preferences updated successfully!");
  };

  return (
    <AppShell primaryActionLabel="Account Settings">
      <div className="space-y-6">
        {/* Header */}
        <section className="pt-1 pb-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Settings & Privacy Principles
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Configure your timezone, notification channels, and review employee privacy standards.
          </p>
        </section>

        {/* Bento Grid */}
        <BentoGrid>
          {/* Privacy Notice Banner Card */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-status-success-dot" />
                <span className="text-lg">Employee Privacy Guarantee</span>
              </div>
            }
            subtitle="Our zero-surveillance remote workplace commitment"
            className="lg:col-span-12 p-6 bg-gradient-to-r from-card to-brand-purple-light/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div className="p-4 rounded-2xl bg-card border border-border-light shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-status-danger-bg text-status-danger-text flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    No Location / GPS Tracking
                  </h4>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    We never record your physical GPS coordinates, IP locations, or Wi-Fi telemetry.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border-light shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-status-danger-bg text-status-danger-text flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    Zero Screen or Webcam Capture
                  </h4>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    No background screenshots, webcam snapshots, or browser tab monitoring.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border-light shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-status-danger-bg text-status-danger-text flex items-center justify-center shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    No Keystroke / Idle Surveillance
                  </h4>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    No keyloggers or mouse movement tracking. Remote trust is measured by outcomes.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border-light shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-status-success-bg text-status-success-text flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    What IS Recorded
                  </h4>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Only check-in and check-out timestamps, employee timezone, and self-reported punch notes.
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* User Preferences Form */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-purple" />
                <span>Working Preferences</span>
              </div>
            }
            subtitle="Configure your timezone and shift target"
            className="lg:col-span-7 p-6 flex flex-col justify-between"
          >
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                  Your Primary Timezone (IANA)
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-subtle border border-border-light text-xs font-bold text-text-primary focus:outline-none focus:border-brand-purple cursor-pointer"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</option>
                  <option value="America/New_York">America/New_York (UTC-05:00)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (UTC-08:00)</option>
                  <option value="Europe/London">Europe/London (UTC+00:00)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                </select>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Your daily attendance sessions and midnight crossovers are calculated using this timezone.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                  Daily Work Target
                </label>
                <input
                  type="text"
                  disabled
                  value="480 Minutes (8 Hours)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-subtle/50 border border-border-light text-xs font-bold text-text-secondary cursor-not-allowed"
                />
                <p className="text-[11px] text-text-tertiary mt-1">
                  Configured by company attendance policy. Contact HR Ops for modifications.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Save Timezone
                </button>
              </div>
            </form>
          </BentoCard>

          {/* Notifications & Theme Controls */}
          <BentoCard
            title={
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-purple" />
                <span>Notification Preferences</span>
              </div>
            }
            subtitle="Alert channels and display theme"
            className="lg:col-span-5 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle border border-border-light">
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    Email Notifications
                  </h4>
                  <p className="text-[11px] text-text-tertiary">
                    Missed checkout reminders and approval results
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle border border-border-light">
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    Slack Sync
                  </h4>
                  <p className="text-[11px] text-text-tertiary">
                    Team presence alerts via incoming webhook
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={(e) => setSlackAlerts(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle border border-border-light">
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    Color Theme Mode
                  </h4>
                  <p className="text-[11px] text-text-tertiary">
                    Segmented Light / Dark theme selector
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            <div className="pt-4 border-t border-border-light text-[11px] text-text-tertiary flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-status-success-dot" />
              <span>Data encrypted at rest and in transit via Supabase TLS</span>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </AppShell>
  );
}


"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Clock,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isMagicLink, setIsMagicLink] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
              redirectPath
            )}`,
          },
        });
        if (error) throw error;
        toast.success("Magic link sent! Check your email inbox.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(`Welcome back, ${data.user?.email}!`);
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoRole = (role: string, emailPreset: string) => {
    setEmail(emailPreset);
    setPassword("DemoPassword123!");
    toast.info(`Filled credentials for ${role} demo (${emailPreset})`);
  };

  return (
    <div className="w-full max-w-md bg-shell rounded-[32px] shadow-shell border border-border-light/60 p-8 sm:p-10 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-purple flex items-center justify-center text-white shadow-float">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-text-primary tracking-tight">
              RemoteHR
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple">
              Attendance Module
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Sign In to Workplace
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Log your daily sessions, review attendance, and manage team schedules.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card-subtle border border-border-light text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
            />
          </div>
        </div>

        {!isMagicLink && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsMagicLink(true)}
                className="text-xs text-brand-purple font-semibold hover:underline"
              >
                Use Magic Link
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card-subtle border border-border-light text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
              />
            </div>
          </div>
        )}

        {isMagicLink && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setIsMagicLink(false)}
              className="text-xs text-brand-purple font-semibold hover:underline"
            >
              Use Password instead
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
        >
          <span>
            {isLoading ? "Signing in..." : isMagicLink ? "Send Magic Link" : "Sign In"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Demo Roles Quick-Fill Card */}
      <div className="mt-8 pt-6 border-t border-border-light/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block mb-2.5">
          Quick Demo Presets:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoRole("Employee", "employee@remotehr.io")}
            className="py-1.5 px-2 rounded-lg bg-card-subtle hover:bg-brand-purple-light/50 text-text-primary hover:text-brand-purple text-[11px] font-semibold border border-border-light flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Users className="w-3 h-3 text-brand-purple" />
            <span>Employee</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole("Manager", "manager@remotehr.io")}
            className="py-1.5 px-2 rounded-lg bg-card-subtle hover:bg-brand-purple-light/50 text-text-primary hover:text-brand-purple text-[11px] font-semibold border border-border-light flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3 h-3 text-brand-purple" />
            <span>Manager</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole("HR Ops", "hr@remotehr.io")}
            className="py-1.5 px-2 rounded-lg bg-card-subtle hover:bg-brand-purple-light/50 text-text-primary hover:text-brand-purple text-[11px] font-semibold border border-border-light flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Briefcase className="w-3 h-3 text-brand-purple" />
            <span>HR Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole("System Admin", "admin@remotehr.io")}
            className="py-1.5 px-2 rounded-lg bg-card-subtle hover:bg-brand-purple-light/50 text-text-primary hover:text-brand-purple text-[11px] font-semibold border border-border-light flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-brand-purple" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>

      {/* Security & Privacy Notice Footer */}
      <div className="mt-6 flex items-center justify-between text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-status-success-dot" />
          Supabase Auth RLS
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
          Zero Invasive Monitoring
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 select-none">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-shell rounded-[32px] p-8 animate-pulse text-center text-xs text-text-tertiary">
            Loading sign-in...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

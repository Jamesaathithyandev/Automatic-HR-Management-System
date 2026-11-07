"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import {
  Search,
  Clock,
  Calendar,
  FileSpreadsheet,
  Moon,
  Sun,
  Shield,
  FileText,
  UserCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="w-full max-w-lg bg-card rounded-3xl shadow-shell border border-border-light overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <Command className="flex flex-col w-full">
          <div className="flex items-center px-4 py-3.5 border-b border-border-light">
            <Search className="w-4 h-4 text-brand-purple mr-2 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search actions or type a command..."
              className="w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-card-subtle transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-text-tertiary font-medium">
              No matching commands found.
            </Command.Empty>

            <Command.Group heading="Attendance Actions" className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              <Command.Item
                onSelect={() => {
                  toast.success("Checked in successfully!");
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-status-success-dot" />
                <span>Check In to Daily Session</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  toast.info("Checked out successfully!");
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4 text-status-danger-dot" />
                <span>Check Out from Session</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  toast.message("Opened Regularization Form");
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-brand-purple" />
                <span>Apply for Attendance Regularization</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation & Views" className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-text-tertiary mt-2">
              <Command.Item
                onSelect={() => {
                  window.location.href = "/attendance";
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4 text-brand-purple" />
                <span>View Monthly Attendance Calendar</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  window.location.href = "/team";
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <UserCheck className="w-4 h-4 text-brand-purple" />
                <span>Manager View: Who's Online Now</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  window.location.href = "/gallery";
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <Shield className="w-4 h-4 text-brand-purple" />
                <span>Component Design Gallery</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Preferences & Tools" className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-text-tertiary mt-2">
              <Command.Item
                onSelect={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-status-warning-dot" />
                ) : (
                  <Moon className="w-4 h-4 text-brand-purple" />
                )}
                <span>Toggle Light / Dark Theme</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  toast.success("Triggering .xlsx attendance report export...");
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-purple-light/50 hover:text-brand-purple cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-status-success-dot" />
                <span>Export Attendance Data (.xlsx)</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="p-3 bg-card-subtle border-t border-border-light flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Use ↑↓ to navigate, ↵ to select</span>
            <span className="font-mono bg-card px-1.5 py-0.5 rounded border border-border-light">
              ESC to close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}


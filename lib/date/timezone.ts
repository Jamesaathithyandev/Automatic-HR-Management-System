import { format, differenceInMinutes, parseISO } from "date-fns";
import { toZonedTime, format as formatZoned } from "date-fns-tz";

/**
 * Returns the work date (YYYY-MM-DD) calculated authoritatively in the employee's timezone
 */
export function getEmployeeWorkDate(timezone: string = "UTC", date: Date = new Date()): string {
  try {
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, "yyyy-MM-dd");
  } catch {
    return format(date, "yyyy-MM-dd");
  }
}

/**
 * Formats a total minute count into a clean human readable duration: "08h 30m"
 */
export function formatDurationMinutes(totalMinutes: number): string {
  const clamped = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
}

/**
 * Formats a timestamp into human-readable local time: "09:30 AM"
 */
export function formatTimeInTimezone(
  dateInput: string | Date,
  timezone: string = "UTC",
  formatString: string = "hh:mm a"
): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return formatZoned(toZonedTime(date, timezone), formatString);
  } catch {
    return "--:--";
  }
}

/**
 * Calculates elapsed continuous seconds from a check_in_at timestamp to now
 */
export function calculateElapsedSeconds(checkInAtIso: string): number {
  try {
    const checkInDate = parseISO(checkInAtIso);
    const now = new Date();
    const diffMs = now.getTime() - checkInDate.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  } catch {
    return 0;
  }
}

/**
 * Evaluates whether an arrival is late based on expected start time (e.g. 09:00 AM) and grace period
 */
export function isLateArrival(
  checkInAtIso: string,
  timezone: string = "UTC",
  expectedStartHour: number = 9,
  expectedStartMinute: number = 0,
  graceMinutes: number = 15
): boolean {
  try {
    const checkInDate = parseISO(checkInAtIso);
    const zoned = toZonedTime(checkInDate, timezone);
    const checkInHour = zoned.getHours();
    const checkInMinute = zoned.getMinutes();

    const actualTotalMinutes = checkInHour * 60 + checkInMinute;
    const allowedThreshold = expectedStartHour * 60 + expectedStartMinute + graceMinutes;

    return actualTotalMinutes > allowedThreshold;
  } catch {
    return false;
  }
}

/**
 * Validates session length and caps at 16 hours
 */
export function calculateSessionDuration(
  checkInAtIso: string,
  checkOutAtIso?: string | null,
  maxCapHours: number = 16
): { durationMinutes: number; wasCapped: boolean } {
  try {
    const start = parseISO(checkInAtIso);
    const end = checkOutAtIso ? parseISO(checkOutAtIso) : new Date();
    const diffMins = differenceInMinutes(end, start);

    const maxMinutes = maxCapHours * 60;
    if (diffMins > maxMinutes) {
      return { durationMinutes: maxMinutes, wasCapped: true };
    }
    return { durationMinutes: Math.max(0, diffMins), wasCapped: false };
  } catch {
    return { durationMinutes: 0, wasCapped: false };
  }
}


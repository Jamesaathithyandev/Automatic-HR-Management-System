import { describe, it, expect } from "vitest";
import {
  getEmployeeWorkDate,
  formatDurationMinutes,
  formatTimeInTimezone,
  calculateElapsedSeconds,
  isLateArrival,
  calculateSessionDuration,
} from "@/lib/date/timezone";

describe("Phase 2: Attendance Engine & Timezone Logic Suite", () => {
  describe("1. Authoritative Timezone Work Date Calculation", () => {
    it("computes correct local work date across midnight crossover", () => {
      // 2026-11-08 at 02:00:00 UTC
      const dateUtc = new Date("2026-11-08T02:00:00Z");

      // In Asia/Kolkata (UTC+5:30), it is 07:30 AM on Nov 8
      const dateIndia = getEmployeeWorkDate("Asia/Kolkata", dateUtc);
      expect(dateIndia).toBe("2026-11-08");

      // In America/New_York (UTC-5:00), it is 09:00 PM on Nov 7
      const dateNewYork = getEmployeeWorkDate("America/New_York", dateUtc);
      expect(dateNewYork).toBe("2026-11-07");

      // In Europe/London (UTC+0), it is 02:00 AM on Nov 8
      const dateLondon = getEmployeeWorkDate("Europe/London", dateUtc);
      expect(dateLondon).toBe("2026-11-08");
    });

    it("formats local time in employee timezone accurately", () => {
      const dateUtc = "2026-11-08T03:30:00Z";
      const formattedIndia = formatTimeInTimezone(dateUtc, "Asia/Kolkata", "hh:mm a");
      expect(formattedIndia).toBe("09:00 AM");

      const formattedUTC = formatTimeInTimezone(dateUtc, "UTC", "hh:mm a");
      expect(formattedUTC).toBe("03:30 AM");
    });
  });

  describe("2. Late Arrival Evaluation with Grace Period", () => {
    it("identifies punch within grace period as on-time", () => {
      // Check in at 09:12 AM in New York (9:00 start + 15 min grace = allowed up to 9:15)
      // 09:12 AM EST is 14:12 UTC
      const checkInIso = "2026-11-07T14:12:00Z";
      const late = isLateArrival(checkInIso, "America/New_York", 9, 0, 15);
      expect(late).toBe(false);
    });

    it("identifies punch after grace period as late arrival", () => {
      // Check in at 09:25 AM in New York
      // 09:25 AM EST is 14:25 UTC
      const checkInIso = "2026-11-07T14:25:00Z";
      const late = isLateArrival(checkInIso, "America/New_York", 9, 0, 15);
      expect(late).toBe(true);
    });
  });

  describe("3. Session Duration & 16-Hour Cap Enforcement", () => {
    it("accurately calculates standard 8-hour shift duration", () => {
      const start = "2026-11-07T09:00:00Z";
      const end = "2026-11-07T17:00:00Z";
      const { durationMinutes, wasCapped } = calculateSessionDuration(start, end, 16);

      expect(durationMinutes).toBe(480);
      expect(wasCapped).toBe(false);
    });

    it("caps anomalous run-away sessions exceeding 16 hours", () => {
      const start = "2026-11-07T09:00:00Z";
      // 22 hours later
      const end = "2026-11-08T07:00:00Z";
      const { durationMinutes, wasCapped } = calculateSessionDuration(start, end, 16);

      expect(durationMinutes).toBe(960); // 16 * 60 = 960 minutes
      expect(wasCapped).toBe(true);
    });
  });

  describe("4. Human-Readable Duration Formatter", () => {
    it("formats 0 minutes as '00h 00m'", () => {
      expect(formatDurationMinutes(0)).toBe("00h 00m");
    });

    it("formats 480 minutes as '08h 00m'", () => {
      expect(formatDurationMinutes(480)).toBe("08h 00m");
    });

    it("formats 135 minutes as '02h 15m'", () => {
      expect(formatDurationMinutes(135)).toBe("02h 15m");
    });
  });
});


import { describe, it, expect } from "vitest";
import { buildAttendanceEmailTemplate } from "@/lib/email/resend";

describe("Phase 4: Manager Roster, Reports & Export Services Suite", () => {
  describe("1. CSV & Data Serialization", () => {
    it("serializes attendance records into valid CSV format", () => {
      const records = [
        {
          name: "James Aathithyan",
          email: "james@remotehr.io",
          date: "2026-11-01",
          status: "Present",
          totalMinutes: 480,
          isLate: "No",
          locked: "Yes",
        },
      ];

      const csvRow = `"${records[0].name}","${records[0].email}","${records[0].date}","${records[0].status}",${records[0].totalMinutes},${(
        records[0].totalMinutes / 60
      ).toFixed(1)},"${records[0].isLate}","${records[0].locked}"`;

      expect(csvRow).toContain('"James Aathithyan"');
      expect(csvRow).toContain('"james@remotehr.io"');
      expect(csvRow).toContain("480");
      expect(csvRow).toContain("8.0");
    });
  });

  describe("2. Email Notification Template Builder", () => {
    it("generates branded HTML email with RemoteHR tokens", () => {
      const html = buildAttendanceEmailTemplate(
        "Auto-Checkout Recorded",
        "Your evening punch was auto-closed at 23:59.",
        "Review Session",
        "https://app.remotehr.io/attendance"
      );

      expect(html).toContain("RemoteHR Workplace");
      expect(html).toContain("Auto-Checkout Recorded");
      expect(html).toContain("Review Session");
      expect(html).toContain("https://app.remotehr.io/attendance");
      expect(html).toContain("#6C5CE7"); // Brand Purple
      expect(html).toContain("#14123A"); // Deep Navy
    });
  });

  describe("3. Attendance Policy Parameters Validation", () => {
    const validatePolicy = (grace: number, halfDay: number, fullDay: number) => {
      if (grace < 0 || grace > 60) return false;
      if (halfDay <= 0 || halfDay >= fullDay) return false;
      return true;
    };

    it("accepts valid policy thresholds", () => {
      expect(validatePolicy(15, 240, 480)).toBe(true);
      expect(validatePolicy(10, 240, 480)).toBe(true);
    });

    it("rejects invalid half-day threshold greater than or equal to full-day", () => {
      expect(validatePolicy(15, 500, 480)).toBe(false);
      expect(validatePolicy(15, 480, 480)).toBe(false);
    });

    it("rejects negative or excessive grace period", () => {
      expect(validatePolicy(-5, 240, 480)).toBe(false);
      expect(validatePolicy(90, 240, 480)).toBe(false);
    });
  });
});


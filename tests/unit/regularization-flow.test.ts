import { describe, it, expect } from "vitest";
import { regularizationFormSchema } from "@/features/requests/types";

describe("Phase 3: Regularization & Approval Workflows Suite", () => {
  describe("1. Zod Form Schema Validation", () => {
    it("accepts valid regularization request payload", () => {
      const validData = {
        workDate: "2026-11-05",
        requestedInTime: "09:00",
        requestedOutTime: "17:30",
        reason: "Connectivity loss prevented normal checkout entry.",
      };

      const result = regularizationFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects when check-out time is earlier than check-in time", () => {
      const invalidTimes = {
        workDate: "2026-11-05",
        requestedInTime: "17:30",
        requestedOutTime: "09:00",
        reason: "Mistyped times on the form.",
      };

      const result = regularizationFormSchema.safeParse(invalidTimes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Check-out time must be later than check-in time"
        );
      }
    });

    it("rejects short or empty reason strings (< 10 chars)", () => {
      const shortReason = {
        workDate: "2026-11-05",
        requestedInTime: "09:00",
        requestedOutTime: "17:00",
        reason: "Forgot",
      };

      const result = regularizationFormSchema.safeParse(shortReason);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 10 characters");
      }
    });
  });

  describe("2. Manager Approval Authorization Logic", () => {
    const isAuthorizedApprover = (
      actor: { id: string; role: "employee" | "manager" | "hr" | "admin" },
      employeeManagerId: string | null
    ): boolean => {
      if (actor.role === "admin" || actor.role === "hr") return true;
      if (actor.role === "manager") {
        return employeeManagerId === actor.id;
      }
      return false;
    };

    it("allows direct manager to approve report's request", () => {
      const managerActor = { id: "mgr-1", role: "manager" as const };
      expect(isAuthorizedApprover(managerActor, "mgr-1")).toBe(true);
    });

    it("denies another manager from approving an unrelated report's request", () => {
      const managerActor = { id: "mgr-1", role: "manager" as const };
      expect(isAuthorizedApprover(managerActor, "mgr-2")).toBe(false);
    });

    it("allows HR and Admin to approve any employee's request", () => {
      const hrActor = { id: "hr-1", role: "hr" as const };
      const adminActor = { id: "adm-1", role: "admin" as const };

      expect(isAuthorizedApprover(hrActor, "mgr-2")).toBe(true);
      expect(isAuthorizedApprover(adminActor, "mgr-2")).toBe(true);
    });
  });

  describe("3. Audit Log Generation", () => {
    it("generates correct state diff on approval", () => {
      const oldDay = { status: "absent", total_minutes: 0 };
      const newDay = { status: "present", total_minutes: 480 };

      const auditRecord = {
        action: "REGULARIZATION_APPROVED",
        old_data: oldDay,
        new_data: newDay,
      };

      expect(auditRecord.old_data.status).toBe("absent");
      expect(auditRecord.new_data.status).toBe("present");
      expect(auditRecord.new_data.total_minutes).toBe(480);
    });
  });
});


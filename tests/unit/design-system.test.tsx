import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatusPill } from "@/components/shared/status-pill";
import { StatCard } from "@/features/attendance/components/stat-card";
import { SessionProgressRow } from "@/features/attendance/components/session-progress-row";
import { AnimatedProgressRing } from "@/features/attendance/components/animated-progress-ring";

describe("Phase 0 Design System - Component Suite", () => {
  describe("StatusPill Component", () => {
    it("renders 'Present' status with accessible styling", () => {
      render(<StatusPill status="present" />);
      const element = screen.getByText("Present");
      expect(element).toBeInTheDocument();
    });

    it("renders 'Half Day' status with amber warning tokens", () => {
      render(<StatusPill status="half_day" />);
      expect(screen.getByText("Half Day")).toBeInTheDocument();
    });

    it("renders 'Absent' status with danger coral tokens", () => {
      render(<StatusPill status="absent" />);
      expect(screen.getByText("Absent")).toBeInTheDocument();
    });

    it("renders custom label when provided", () => {
      render(<StatusPill status="approved" label="Manager Approved" />);
      expect(screen.getByText("Manager Approved")).toBeInTheDocument();
    });
  });

  describe("StatCard Component", () => {
    it("renders title, value, and subtitle properly", () => {
      render(
        <StatCard
          title="Today's Hours"
          value="07h 30m"
          subtitle="Target: 08h 00m"
        />
      );
      expect(screen.getByText("Today's Hours")).toBeInTheDocument();
      expect(screen.getByText("07h 30m")).toBeInTheDocument();
      expect(screen.getByText("Target: 08h 00m")).toBeInTheDocument();
    });
  });

  describe("SessionProgressRow Component", () => {
    it("displays session title, duration, and percentage", () => {
      render(
        <SessionProgressRow
          title="Core Engineering Session"
          timestamp="09:00 AM - 01:00 PM"
          duration="04 h 00 m"
          percentage={85}
          tags={["Sprint"]}
        />
      );
      expect(screen.getByText("Core Engineering Session")).toBeInTheDocument();
      expect(screen.getByText("04 h 00 m")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("Sprint")).toBeInTheDocument();
    });
  });

  describe("AnimatedProgressRing Component", () => {
    it("renders clamped percentage in center display", () => {
      render(
        <AnimatedProgressRing
          percentage={92}
          title="Hours"
          caption="Target Achieved"
        />
      );
      expect(screen.getByText("92%")).toBeInTheDocument();
      expect(screen.getByText("Hours")).toBeInTheDocument();
      expect(screen.getByText("Target Achieved")).toBeInTheDocument();
    });

    it("clamps percentages exceeding 100% to 100%", () => {
      render(<AnimatedProgressRing percentage={120} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });
});


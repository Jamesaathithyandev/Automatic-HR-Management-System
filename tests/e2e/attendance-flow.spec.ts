import { test, expect } from "@playwright/test";

test.describe("Attendance Management System - E2E Flows", () => {
  test("Design System Gallery loads correctly with tokens and shell", async ({
    page,
  }) => {
    await page.goto("/gallery");

    // Check title and shell container
    await expect(page.locator("h1")).toContainText("Design System Gallery");

    // Verify bento cards and progress rings render
    const progressRings = page.locator("svg circle");
    await expect(progressRings.first()).toBeVisible();

    // Verify theme toggle button
    const themeBtn = page.getByRole("button", { name: /toggle theme/i });
    await expect(themeBtn).toBeVisible();
  });

  test("Authentication page displays role presets and password toggle", async ({
    page,
  }) => {
    await page.goto("/login");

    // Page title and remote HR logo
    await expect(page.locator("h1")).toContainText("Sign In to Workplace");
    await expect(page.getByText("RemoteHR")).toBeVisible();
    await expect(page.getByText("Attendance Module")).toBeVisible();

    // Quick demo role buttons
    const employeePreset = page.getByRole("button", { name: "Employee" });
    const managerPreset = page.getByRole("button", { name: "Manager" });
    const hrPreset = page.getByRole("button", { name: "HR Admin" });
    const adminPreset = page.getByRole("button", { name: "Super Admin" });

    await expect(employeePreset).toBeVisible();
    await expect(managerPreset).toBeVisible();
    await expect(hrPreset).toBeVisible();
    await expect(adminPreset).toBeVisible();

    // Click Employee preset to auto-fill
    await employeePreset.click();
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toHaveValue("employee@remotehr.io");
    await expect(passwordInput).toHaveValue("DemoPassword123!");

    // Verify privacy and RLS assurance badge
    await expect(page.getByText("Zero Invasive Monitoring")).toBeVisible();
    await expect(page.getByText("Supabase Auth RLS")).toBeVisible();
  });

  test("Settings page enforces privacy manifesto and preference controls", async ({
    page,
  }) => {
    await page.goto("/settings");

    // Verify Privacy Architecture Banner
    await expect(page.getByText("Zero-Invasive Privacy Manifesto")).toBeVisible();
    await expect(page.getByText("NO Location Tracking / GPS")).toBeVisible();
    await expect(page.getByText("NO Webcam / Screen Captures")).toBeVisible();
    await expect(page.getByText("NO Keystroke / Activity Logging")).toBeVisible();

    // Verify Work Schedule inputs
    await expect(page.getByText("Work Schedule & Shift")).toBeVisible();
    await expect(page.getByLabel("Time Zone")).toBeVisible();
  });

  test("Attendance export route handler returns valid CSV and XLSX headers", async ({
    request,
  }) => {
    // 1. Test CSV Export
    const csvResponse = await request.get("/api/attendance/export?format=csv");
    expect(csvResponse.ok()).toBeTruthy();
    expect(csvResponse.headers()["content-type"]).toContain("text/csv");
    expect(csvResponse.headers()["content-disposition"]).toContain(
      "attendance-report-"
    );
    const csvBody = await csvResponse.text();
    expect(csvBody).toContain("Employee ID,Date,Status,Total Minutes");

    // 2. Test Excel (.xlsx) Export
    const xlsxResponse = await request.get("/api/attendance/export?format=xlsx");
    expect(xlsxResponse.ok()).toBeTruthy();
    expect(xlsxResponse.headers()["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(xlsxResponse.headers()["content-disposition"]).toContain(".xlsx");
  });
});


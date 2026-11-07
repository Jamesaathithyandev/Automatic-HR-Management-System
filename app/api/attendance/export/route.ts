import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formatType = searchParams.get("format") || "xlsx";
  const monthParam = searchParams.get("month") || format(new Date(), "yyyy-MM");

  // Mock attendance records for export generation
  const records = [
    {
      name: "James Aathithyan",
      email: "james@remotehr.io",
      date: "2026-11-01",
      status: "Present",
      totalMinutes: 495,
      isLate: "No",
      locked: "Yes",
    },
    {
      name: "Rachel Lee",
      email: "rachel@remotehr.io",
      date: "2026-11-01",
      status: "Present",
      totalMinutes: 480,
      isLate: "No",
      locked: "Yes",
    },
    {
      name: "Ken Smith",
      email: "ken@remotehr.io",
      date: "2026-11-01",
      status: "Half Day",
      totalMinutes: 240,
      isLate: "Yes",
      locked: "Yes",
    },
    {
      name: "Eleanor Pena",
      email: "eleanor@remotehr.io",
      date: "2026-11-01",
      status: "Present",
      totalMinutes: 510,
      isLate: "No",
      locked: "Yes",
    },
    {
      name: "James Aathithyan",
      email: "james@remotehr.io",
      date: "2026-11-02",
      status: "Present",
      totalMinutes: 480,
      isLate: "No",
      locked: "No",
    },
    {
      name: "Rachel Lee",
      email: "rachel@remotehr.io",
      date: "2026-11-02",
      status: "On Leave",
      totalMinutes: 0,
      isLate: "No",
      locked: "No",
    },
  ];

  // 1. CSV Stream Format
  if (formatType === "csv") {
    const csvHeader = "Employee Name,Work Email,Work Date,Status,Total Minutes,Total Hours,Is Late,Locked\n";
    const csvRows = records
      .map(
        (r) =>
          `"${r.name}","${r.email}","${r.date}","${r.status}",${r.totalMinutes},${(
            r.totalMinutes / 60
          ).toFixed(1)},"${r.isLate}","${r.locked}"`
      )
      .join("\n");

    return new NextResponse(csvHeader + csvRows, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="attendance-${monthParam}.csv"`,
      },
    });
  }

  // 2. Styled ExcelJS .xlsx Format
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RemoteHR System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Monthly Attendance", {
    views: [{ showGridLines: true }],
  });

  // Define Columns
  worksheet.columns = [
    { header: "Employee Name", key: "name", width: 22 },
    { header: "Work Email", key: "email", width: 26 },
    { header: "Date", key: "date", width: 14 },
    { header: "Day Status", key: "status", width: 16 },
    { header: "Total Minutes", key: "totalMinutes", width: 16 },
    { header: "Hours", key: "hours", width: 12 },
    { header: "Late Arrival", key: "isLate", width: 14 },
    { header: "Payroll Locked", key: "locked", width: 16 },
  ];

  // Header Row Styling (Brand Deep Navy #14123A with White Bold Text)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF14123A" },
    };
    cell.font = {
      name: "Arial",
      color: { argb: "FFFFFFFF" },
      bold: true,
      size: 11,
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF6C5CE7" } },
    };
  });

  // Populate data rows
  records.forEach((rec, idx) => {
    const row = worksheet.addRow({
      name: rec.name,
      email: rec.email,
      date: rec.date,
      status: rec.status,
      totalMinutes: rec.totalMinutes,
      hours: Number((rec.totalMinutes / 60).toFixed(1)),
      isLate: rec.isLate,
      locked: rec.locked,
    });

    row.height = 20;

    // Zebra striping for readability
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF6F7FB" },
        };
      });
    }

    row.eachCell((cell) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE2E4F0" } },
      };
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance-${monthParam}.xlsx"`,
    },
  });
}


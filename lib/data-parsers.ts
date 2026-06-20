import { ElecRow, TaxRow, WaterRow } from "./types";

export function parseWaterData(rows: string[][]): WaterRow[] {
  // rows from Sheet1 via google-sheets API
  const data: WaterRow[] = [];
  for (const r of rows) {
    if (!r[1] || r[1] === "Year" || r[1] === "Total") continue;
    const year = String(r[1]).trim();
    if (!year.includes("-")) continue;
    data.push({
      year: year.slice(0, 7), // "2014-15"
      Takari: parseFloat(r[2]) || 0,
      Mhaisal: parseFloat(r[3]) || 0,
      Tembhu: parseFloat(r[4]) || 0,
      Total: parseFloat(r[5]) || 0,
    });
  }
  return data;
}

export function parseTaxData(rows: string[][]): TaxRow[] {
  const data: TaxRow[] = [];
  let currentScheme = "";

  for (const r of rows) {
    // Track current scheme name — col[1] contains scheme name on data rows
    const schemeCell = String(r[1] ?? "").trim();
    const yearCell = String(r[2] ?? "").trim();

    // Skip header, total, empty rows — only want rows where year looks like "YYYY-YYYY"
    if (!yearCell.match(/^\d{4}-\d{4}$/)) continue;

    // Update scheme tracker whenever col[1] has a value
    if (schemeCell.includes("Irrigation")) currentScheme = schemeCell;

    data.push({
      scheme: currentScheme,
      year: yearCell,
      waterIncl: parseFloat(r[3]) || 0,
      waterExcl: parseFloat(r[4]) || 0,
      expectedTax: parseFloat(r[6]) || 0,
      actualRecovery: parseFloat(r[7]) || 0,
      difference: parseFloat(r[8]) || 0,
    });
  }
  return data;
}

export function parseElecData(rows: string[][]): ElecRow[] {
  const data: ElecRow[] = [];
  for (const r of rows) {
    if (!r[1] || r[1] === "Month" || r[1] === "Total") continue;
    const raw = String(r[1]);
    // Format: "2026-04-25 00:00:00" → "Apr"
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const parts = raw.split("-");
    if (parts.length >= 2) {
      const m = parseInt(parts[1]) - 1;
      const label = monthNames[m] ?? raw.slice(0, 7);
      data.push({ month: label, charges: parseFloat(r[2]) || 0 });
    }
  }
  return data;
}

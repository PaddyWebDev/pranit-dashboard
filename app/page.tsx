import * as XLSX from "xlsx";

import { loadWorkbook } from "@/data/excel";
import ExcelDashboardClient from "./ExcelDashboardClient";

type DashboardSheet = {
  name: string;
  columns: string[];
  rows: Record<string, unknown>[];
};

function sheetToDashboardSheet(
  sheet: XLSX.WorkSheet,
  name: string,
): DashboardSheet {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: false,
  });

  const safeRows = JSON.parse(JSON.stringify(rows));

  const columnsSet = new Set<string>();

  for (const row of safeRows) {
    Object.keys(row).forEach((key) => columnsSet.add(key));
  }

  return {
    name,
    columns: [...columnsSet],
    rows: safeRows,
  };
}

export default async function Home() {
  const { sheets } = await loadWorkbook();

  const dashboardSheets: DashboardSheet[] = sheets.map((s) =>
    sheetToDashboardSheet(s.sheet, s.name),
  );

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <ExcelDashboardClient sheets={dashboardSheets} />
    </div>
  );
}

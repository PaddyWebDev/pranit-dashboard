import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export type WorkbookSheet = {
  name: string;
  sheet: XLSX.WorkSheet;
};

function getExcelFilePath(): string {
  return path.join(
    process.cwd(),
    "data",
    "Detailed_Water_Distribution_Dashboard_Data.xlsx",
  );
}

export async function loadWorkbook(): Promise<{
  workbook: XLSX.WorkBook;
  sheets: WorkbookSheet[];
}> {
  const filePath = getExcelFilePath();

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  try {
    const buffer = fs.readFileSync(filePath);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheets: WorkbookSheet[] = workbook.SheetNames.map((name) => ({
      name,
      sheet: workbook.Sheets[name],
    }));

    return {
      workbook,
      sheets,
    };
  } catch (error) {
    console.error("Workbook loading failed:", error);
    throw error;
  }
}

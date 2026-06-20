import { NextRequest, NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";

export async function GET(req: NextRequest) {
  try {
    const sheetName = req.nextUrl.searchParams.get("sheetName");

    if (!sheetName) {
      return new NextResponse("Sheet Name is Required", { status: 400 });
    }

    const sheets = await getSheetData(sheetName);
    return NextResponse.json(
      { message: "Data fetched successfully", data: sheets },
      { status: 200 },
    );
  } catch (error) {
    console.log(error );
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}

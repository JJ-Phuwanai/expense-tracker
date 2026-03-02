import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID, SETTINGS_SHEET } from "@/lib/sheets";

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SETTINGS_SHEET}!F2:H`,
    });

    const rows = res.data.values ?? [];
    const users = rows
      .filter((r) => r[2] === "TRUE")
      .map((r) => ({
        id: r[0],
        name: r[1],
      }));

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, SETTINGS_SHEET } from '@/lib/sheets';

export async function GET() {
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SETTINGS_SHEET}!C2:C`,
    });

    const values = res.data.values ?? [];
    const categories = values.map((r) => String(r[0]).trim()).filter(Boolean);

    return NextResponse.json({ categories });
}

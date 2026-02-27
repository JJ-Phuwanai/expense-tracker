import { NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, SETTINGS_SHEET } from '@/lib/sheets';

export async function GET() {
    try {
        const sheets = await getSheetsClient();

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SETTINGS_SHEET}!D2:D`,
        });

        const values = res.data.values ?? [];
        const categories = values.map((r) => String(r[0]).trim()).filter(Boolean);

        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { category } = body;

        if (!category) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const sheets = await getSheetsClient();

        const getRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SETTINGS_SHEET}!D:D`,
        });

        const currentValues = getRes.data.values || [];
        const nextRow = currentValues.length + 1;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${SETTINGS_SHEET}!D${nextRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[category]],
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error adding category:', error);
        return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
    }
}

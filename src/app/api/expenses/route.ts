import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSheetsClient, SHEET_ID, EXPENSES_SHEET } from '@/lib/sheets';

const ExpenseSchema = z.object({
    date: z.string().min(1),
    item: z.string().min(1),
    type: z.string().min(1),
    amount: z.number().finite(),
    category: z.string().optional().default(''),
    owner: z.string().optional().default(''),
});

export async function GET() {
    try {
        const sheets = await getSheetsClient();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${EXPENSES_SHEET}!A2:F`,
        });

        const rows = res.data.values ?? [];
        const expenses = rows.map((r, i) => ({
            rowIndex: i + 2,
            date: r[0] ?? '',
            item: r[1] ?? '',
            type: r[2] ?? '',
            amount: Number(r[3] ?? 0),
            category: r[4] ?? '',
            owner: r[5] ?? '',
        }));

        return NextResponse.json({ expenses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (typeof body?.amount === 'string') body.amount = Number(body.amount);

        const parsed = ExpenseSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { date, item, type, amount, category, owner } = parsed.data;
        const sheets = await getSheetsClient();

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${EXPENSES_SHEET}!A:F`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[date, item, type, amount, category, owner]],
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { rowIndex } = await req.json();
        if (!rowIndex) return NextResponse.json({ error: 'Row Index required' }, { status: 400 });

        const sheets = await getSheetsClient();

        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === EXPENSES_SHEET);
        const sheetId = sheet?.properties?.sheetId;

        if (sheetId === undefined) {
            return NextResponse.json({ error: 'Sheet ID not found' }, { status: 404 });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex - 1,
                                endIndex: rowIndex,
                            },
                        },
                    },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('DELETE Error:', error.message);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { rowIndex, item, category, amount } = body;

        if (!rowIndex) return NextResponse.json({ error: 'Row Index required' }, { status: 400 });

        const sheets = await getSheetsClient();

        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${EXPENSES_SHEET}!B${rowIndex}:E${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[item, body.type, amount, category]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('UPDATE Error:', error.message);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSheetsClient, SHEET_ID, BUDGET_SHEET } from '@/lib/sheets';

const BudgetSchema = z.object({
    section: z.string().min(1),
    item: z.string().min(1),
    amount: z.number().finite(),
    date: z.string().min(1),
    note: z.string().optional(),
});

const getCurrentMonthStr = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}/${year}`;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get('personId') || '1';

    const sheets = await getSheetsClient();
    const currentMonthStr = getCurrentMonthStr();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${BUDGET_SHEET}!A2:F`,
    });

    let rows = res.data.values ?? [];

    const currentMonthExists = rows.some((r) => r[0] === '1' && r[4] === currentMonthStr);

    if (!currentMonthExists && rows.length > 0) {
        const myRows = rows.filter((r) => r[0] === '1');
        if (myRows.length > 0) {
            const lastDateInSheet = myRows[myRows.length - 1][4];
            const templateRows = myRows.filter((r) => r[4] === lastDateInSheet);

            const newRows = templateRows.map((r) => ['1', r[1], r[2], r[3], currentMonthStr, '']);

            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: `${BUDGET_SHEET}!A:F`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: newRows },
            });

            const updatedRes = await sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: `${BUDGET_SHEET}!A2:F`,
            });
            rows = updatedRes.data.values ?? [];
        }
    }

    const plans = rows
        .map((r, index) => ({
            rowIndex: index + 2,
            person_id: r[0],
            section: r[1] ?? '',
            item: r[2] ?? '',
            amount: Number(r[3] ?? 0),
            date: r[4] ?? '',
            note: r[5] ?? '',
        }))
        .filter((p) => p.person_id === personId);

    return NextResponse.json({ plans });
}

export async function POST(req: Request) {
    const body = await req.json();
    if (typeof body?.amount === 'string') body.amount = Number(body.amount);

    const parsed = BudgetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { section, item, amount, date, note } = parsed.data;
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${BUDGET_SHEET}!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['1', section, item, amount, date, note ?? '']],
        },
    });
    return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
    const body = await req.json();
    const { rowIndex, ...data } = body;

    if (typeof data.amount === 'string') data.amount = Number(data.amount);
    const parsed = BudgetSchema.safeParse(data);
    if (!parsed.success || !rowIndex) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const { section, item, amount, date, note } = parsed.data;
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${BUDGET_SHEET}!A${rowIndex}:F${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['1', section, item, amount, date, note ?? '']],
        },
    });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    try {
        const { rowIndex } = await req.json();
        const sheets = await getSheetsClient();

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 1535731208,
                                dimension: 'ROWS',
                                startIndex: rowIndex - 1,
                                endIndex: rowIndex,
                            },
                        },
                    },
                ],
            },
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

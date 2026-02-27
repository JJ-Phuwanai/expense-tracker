import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSheetsClient, SHEET_ID, BUDGET_SHEET } from '@/lib/sheets';

const BudgetSchema = z.object({
    section: z.string().min(1),
    item: z.string().min(1),
    amount: z.number().finite(),
    date: z.string().min(1),
});

const getCurrentMonthStr = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}/${year}`;
};

export async function GET() {
    const sheets = await getSheetsClient();
    const currentMonthStr = getCurrentMonthStr();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${BUDGET_SHEET}!A2:E`,
    });

    let rows = res.data.values ?? [];

    const currentMonthExists = rows.some((r) => r[0] === '1' && r[4] === currentMonthStr);

    if (!currentMonthExists && rows.length > 0) {
        const myRows = rows.filter((r) => r[0] === '1');
        if (myRows.length > 0) {
            const lastDateInSheet = myRows[myRows.length - 1][4];
            const templateRows = myRows.filter((r) => r[4] === lastDateInSheet);

            const newRows = templateRows.map((r) => ['1', r[1], r[2], r[3], currentMonthStr]);

            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: `${BUDGET_SHEET}!A:E`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: newRows },
            });

            const updatedRes = await sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: `${BUDGET_SHEET}!A2:E`,
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
        }))
        .filter((p) => p.person_id === '1' && p.date === currentMonthStr);

    return NextResponse.json({ plans });
}

export async function POST(req: Request) {
    const body = await req.json();
    if (typeof body?.amount === 'string') body.amount = Number(body.amount);

    const parsed = BudgetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { section, item, amount, date } = parsed.data;
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${BUDGET_SHEET}!A:E`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['1', section, item, amount, date]],
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

    const { section, item, amount, date } = parsed.data;
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${BUDGET_SHEET}!A${rowIndex}:E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['1', section, item, amount, date]],
        },
    });
    return NextResponse.json({ ok: true });
}
